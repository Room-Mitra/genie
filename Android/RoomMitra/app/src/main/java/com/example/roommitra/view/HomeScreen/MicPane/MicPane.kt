package com.example.roommitra.view

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.navigation.NavHostController
import com.example.roommitra.ConversationMessage
import com.example.roommitra.agent.AgenticHandlerRegistry
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import com.example.roommitra.service.PollingManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.util.Locale
import java.util.UUID

// ===========================================================================
// region ENUMS & STATE CLASSES
// ===========================================================================
enum class ListenState { Idle, Listening, Thinking, Speaking, Muted }
// endregion

// ===========================================================================
// region MIC STATE SERVICE — single source of truth
// ===========================================================================
class MicStateService {
    private val _listenState = mutableStateOf(ListenState.Idle)
    val listenState: State<ListenState> get() = _listenState

    private val _isMuted = mutableStateOf(false)
    val isMuted: State<Boolean> get() = _isMuted

    fun setState(state: ListenState) {
        Log.d("MicStateService", "State change: ${_listenState.value} → $state")
        _listenState.value = state
    }

    fun mute() {
        _isMuted.value = true
        _listenState.value = ListenState.Muted
        Log.i("MicStateService", "Mic muted")
    }

    fun unmute() {
        Log.i("MicStateService", "Mic unmuted")
        _isMuted.value = false
        _listenState.value = ListenState.Idle
    }

    fun reset() {
        _listenState.value = ListenState.Idle
        _isMuted.value = false
        Log.d("MicStateService", "Mic state reset to Idle")
    }
}
// endregion

// ===========================================================================
// region TTS MANAGER
// ===========================================================================
class TtsManager(private val ctx: Context) {
    var isInitialized = false
        private set
    val isPlaying = mutableStateOf(false)
    private var tts: TextToSpeech? = null

    init {
        tts = TextToSpeech(ctx) { status ->
            if (status == TextToSpeech.SUCCESS) {
                isInitialized = true
                val selected = tts?.voices?.find {
                    it.name.contains("en-in", true) &&
                            it.name.contains("en-in-x-end-network", true)
                }
                if (selected != null) tts?.voice = selected
                else tts?.language = Locale("en", "IN")
                Log.d("TtsManager", "Initialized with voice: ${tts?.voice?.name ?: "default"}")

                tts?.setOnUtteranceProgressListener(object :
                    android.speech.tts.UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        isPlaying.value = true
                        Log.d("TtsManager", "TTS started: $utteranceId")
                    }

                    override fun onDone(utteranceId: String?) {
                        isPlaying.value = false
                        Log.d("TtsManager", "TTS done: $utteranceId")
                    }

                    override fun onError(utteranceId: String?) {
                        isPlaying.value = false
                        Log.d("TtsManager", "TTS Error occurred: $utteranceId")
                    }
                })
            } else Log.w("TtsManager", "TTS init failed: $status")
        }
    }

    fun speak(text: String) {
        if (!isInitialized) {
            Log.w("TtsManager", "TTS not initialized")
            return
        }
        try {
            val utteranceId = UUID.randomUUID().toString()
            tts?.speak(text, TextToSpeech.QUEUE_ADD, null, utteranceId)
            Log.d("TtsManager", "Speaking: \"$text\"")
        } catch (e: Exception) {
            Log.e("TtsManager", "speak() error: ${e.message}")
        }
    }

    fun stopImmediately() {
        tts?.stop()
        isPlaying.value = false
        Log.d("TtsManager", "TTS stopImmediately called")
    }

    fun shutdown() {
        Log.d("TtsManager", "TTS shutdown initiated")
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
            Log.w("TtsManager", "shutdown error: ${e.message}")
        } finally {
            tts = null
            isInitialized = false
            isPlaying.value = false
        }
    }
}
// endregion

// ===========================================================================
// region MIC CONTROLLER — observes MicStateService
// ===========================================================================
class MicController(
    private val ctx: Context,
    private val micStateService: MicStateService,
    private val onFinalUtterance: (String) -> Unit,
    private val ttsManager: TtsManager,
    val conversation: SnapshotStateList<ConversationMessage>,
    private val onSessionReset: () -> Unit
) {
    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false
    fun initialize() {
        if (!SpeechRecognizer.isRecognitionAvailable(ctx)) return
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(ctx).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    Log.d("MicController", "Ready for speech")
                }

                override fun onBeginningOfSpeech() {
                    Log.d("MicController", "Speech input started")
                }

                override fun onEndOfSpeech() {
                    micStateService.setState(ListenState.Thinking)
//                    Handler(Looper.getMainLooper()).postDelayed({
//                        if (isListening) {
//                            speechRecognizer?.cancel()
//                            micStateService.setState(ListenState.Idle)
//                        }
//                    }, 1500) // 1.5s grace period
                }


                override fun onError(error: Int) {
                    Log.e("MicController", "STT Error code: $error")

                    when (error) {
                        SpeechRecognizer.ERROR_NO_MATCH -> {
                            Log.d("MicController", "No match – possibly short utterance.")
                            micStateService.setState(ListenState.Idle)
                            isListening = false
//                            onFinalUtterance("") // treat as unclear speech
                        }

                        SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> {
                            Log.d("MicController", "Speech timeout, restarting listener")
                            micStateService.setState(ListenState.Idle)
                            isListening = false
//                            onFinalUtterance("") // Optionally restart listening automatically here
                        }

                        else -> {
                            micStateService.setState(ListenState.Idle)
                            isListening = false
                        }
                    }
                }


                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        onFinalUtterance(matches[0])
                        Log.d("MicController", "STT Final Result: \"$matches[0]\"")
                    }
                    isListening = false
                }

                //                override fun onPartialResults(partialResults: Bundle?) {Log.d("MicController", "STT Partial Result ${partialResults}")}
                override fun onPartialResults(partialResults: Bundle?) {
                    val partial =
                        partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!partial.isNullOrEmpty()) {
                        val text = partial[0].trim()
                        Log.d("MicController", "STT Partial Result: \"$text\"")
                        /*  if (text.equals("yes", true) || text.equals("no", true)) {
                              onFinalUtterance(text)
                              speechRecognizer?.stopListening()
                          }*/
                    }
                }

                override fun onSegmentResults(segmentResults: Bundle) {
                    Log.d("MicController", "onSegmentResults  ${segmentResults}")
                }

                override fun onEvent(eventType: Int, params: Bundle?) {
                    Log.d("MicController", "onEvent ${eventType} ,, ${params}")
                }

                override fun onBufferReceived(buffer: ByteArray?) {
                    Log.d("MicController", "onBufferReceived ${buffer}")
                }

                override fun onRmsChanged(rmsdB: Float) {}
            })
        }
    }

    fun startListening() {
        Log.d("MicController", "Start listening called - ${Locale.getDefault()}")
        if (isListening || micStateService.isMuted.value) return
        micStateService.setState(ListenState.Listening)
        isListening = true
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_WEB_SEARCH
            )
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
//            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
        }
        speechRecognizer?.startListening(intent)
    }

    fun stopListening() {
        Log.d("MicController", "Stop listening called")
        if (!isListening) return
        speechRecognizer?.stopListening()
        micStateService.setState(ListenState.Idle)
        isListening = false
    }

    fun mute() {
        Log.i("MicController", "Mic manually muted")
        micStateService.mute()
        ttsManager.stopImmediately()
        stopListening()
    }

    fun unmute() {
        Log.i("MicController", "Mic manually unmuted")
        micStateService.unmute()
    }

    fun dispose() {
        Log.d("MicController", "SpeechRecognizer destroyed")
        speechRecognizer?.destroy()
        speechRecognizer = null
        micStateService.reset()
        isListening = false
    }

    suspend fun autoClearConversationAfter(delayMillis: Long = 60_000L) {
        Log.d("MicController", "Auto clear timer started ($delayMillis ms)")
        if (conversation.isNotEmpty()) {
            kotlinx.coroutines.delay(delayMillis)
            conversation.clear()
            if (!micStateService.isMuted.value) onSessionReset()
        }
        Log.d("MicController", "Conversation cleared, triggering session reset")
    }

    fun onTtsStateChanged(ttsPlaying: Boolean) {
        Log.d(
            "MicController",
            "TTS State changed → ttsPlaying=$ttsPlaying, listenState=${micStateService.listenState.value}"
        )
        val newState = when {
            micStateService.isMuted.value -> ListenState.Muted
            ttsPlaying -> ListenState.Speaking
            !ttsPlaying && micStateService.listenState.value == ListenState.Speaking -> ListenState.Idle
            else -> micStateService.listenState.value
        }
        micStateService.setState(newState)
    }
}
// endregion

// ===========================================================================
// region COMPOSABLE HELPERS
// ===========================================================================
@Composable
fun rememberRecordAudioPermission(
    onPermissionGranted: (() -> Unit)? = null
): Pair<MutableState<Boolean>, () -> Unit> {
    val context = LocalContext.current
    val hasPermission = remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                    PackageManager.PERMISSION_GRANTED
        )
    }
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasPermission.value = granted
        if (granted) onPermissionGranted?.invoke()
    }
    return hasPermission to { launcher.launch(Manifest.permission.RECORD_AUDIO) }
}

@Composable
fun rememberMicController(
    onFinalUtterance: (String) -> Unit,
    autoListenTrigger: MutableState<Long>,
    ttsManager: TtsManager,
    conversation: SnapshotStateList<ConversationMessage>,
    onSessionReset: () -> Unit
): Pair<MicController, MicStateService> {
    val ctx = LocalContext.current
    val micStateService = remember { MicStateService() }
    val controller = remember {
        MicController(
            ctx,
            micStateService,
            onFinalUtterance,
            ttsManager,
            conversation,
            onSessionReset
        )
    }

    val (hasRecordPerm, _) = rememberRecordAudioPermission { controller.startListening() }
    val ttsPlaying by ttsManager.isPlaying
    var pendingAutoListen by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        controller.initialize()
        onDispose { controller.dispose() }
    }

    LaunchedEffect(autoListenTrigger.value) {
        if (autoListenTrigger.value != 0L) pendingAutoListen = true
    }

    LaunchedEffect(pendingAutoListen, ttsPlaying, micStateService.listenState.value) {
        if (pendingAutoListen && !ttsPlaying &&
            micStateService.listenState.value !in listOf(
                ListenState.Listening,
                ListenState.Thinking,
                ListenState.Muted
            )
        ) {
            if (hasRecordPerm.value) controller.startListening()
            pendingAutoListen = false
        }
    }

    LaunchedEffect(ttsPlaying, micStateService.isMuted.value) {
        controller.onTtsStateChanged(ttsPlaying)
    }

    LaunchedEffect(conversation.size) {
        controller.autoClearConversationAfter()
    }

    return controller to micStateService
}
// endregion

// ===========================================================================
// region MAIN COMPOSABLE — MicPane UI
// ===========================================================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MicPane(
    modifier: Modifier = Modifier,
    navController: NavHostController,
    musicController: MusicPlayerController
) {
    val ctx = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val apiService = remember { ApiService(ctx) }
    val conversation = remember { mutableStateListOf<ConversationMessage>() }
    val autoListenTrigger = remember { mutableStateOf(0L) }
    val ttsManager = remember { TtsManager(ctx) }
    var sessionId by remember { mutableStateOf("null") }
    val agenticHandler = remember { AgenticHandlerRegistry(ctx) }

    val sessionReset: () -> Unit = { sessionId = "null" }

    var firstName by remember { mutableStateOf("Guest") }
    val bookingRepo = PollingManager.getBookingRepository()
    val bookingData by bookingRepo.bookingData.collectAsState()
    LaunchedEffect(bookingData) {
        Log.d("MicPane", "Booking data changed: $bookingData")
        val booking = bookingData?.optJSONObject("booking")
        val guest = booking?.optJSONObject("guest")
        firstName = guest?.optString("firstName", "Guest") ?: "Guest"

    }

    fun sendUtteranceToServer(userQuery: String) {
        coroutineScope.launch {
            try {
                val payload = JSONObject().apply {
                    put("message", userQuery)
                    if (sessionId != "null") {
                        put("conversationId", sessionId)
                    }
                }
                Log.i(
                    "MicPane",
                    "Attempting to send User query : \"$userQuery\" sessionId=$sessionId"
                )
                val result = withContext(Dispatchers.IO) {
                    apiService.post("conversations", payload)
                }
                when (result) {
                    is ApiResult.Success -> {
                        val json = result.data
                        val message = json?.optString("message", "") ?: ""
                        val conversationId = json?.optString("conversationId", "null") ?: "null"
                        val isConversationOpen =
                            json?.optBoolean("isConversationOpen", false) ?: false
                        val agentsArray = json?.optJSONArray("agents")
                        Log.d("MicPane", "Server response: $message")
                        Log.d("MicPane", "Server response: $isConversationOpen")
                        Log.d("MicPane", "Server response: $agentsArray")
                        // Update the sessionId with the value from the server
                        sessionId = conversationId
                        if (agentsArray != null && agentsArray.length() > 0) {
                            for (i in 0 until agentsArray.length()) {
                                val agent = agentsArray.getJSONObject(i)
                                val agentType = agent.optString("type", "")

                                val parameters = mutableListOf<String>()
                                agent.optJSONArray("parameters")?.let { params ->
                                    for (j in 0 until params.length()) {
                                        params.optString(j)?.takeIf { it.isNotEmpty() }
                                            ?.let { parameters.add(it) }
                                    }
                                }


                                if (agentType.isNotEmpty()) {
//                                        musicController.playlist(parameters)
                                    // Safe to call agent handler
                                    agenticHandler.callAgent(
                                        agentType,
                                        parameters,
                                        coroutineScope
                                    )
                                }
                            }
                        }

                        if (message.isNotEmpty()) {
                            Log.d(
                                "MicPane",
                                "Server success: speech=\"${message.take(100)}\" isSessionOpen=$isConversationOpen"
                            )
                            conversation.add(ConversationMessage(message, false))
                            ttsManager.speak(message)
                        } else ttsManager.speak("No response from server.")
                        if (isConversationOpen)
                            autoListenTrigger.value = System.currentTimeMillis()
                    }

                    is ApiResult.Error -> {
                        ttsManager.speak("Something went wrong. Please try later")
                        Log.e("MicPane", "Server error: ${result}")
                    }
                }
            } catch (e: Exception) {
                ttsManager.speak("Something went wrong. Please try later")
            }
        }
    }

    val (micController, micStateService) = rememberMicController(
        onFinalUtterance = { text ->
            conversation.add(ConversationMessage(text, true))
            sendUtteranceToServer(text)
        },
        autoListenTrigger = autoListenTrigger,
        ttsManager = ttsManager,
        conversation = conversation,
        onSessionReset = sessionReset
    )

    val listenState by micStateService.listenState
    val isMuted by micStateService.isMuted
    val listState = rememberLazyListState()

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF141E30), Color(0xFF243B55))))
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            SecretLogoTrigger(navController)
            Spacer(Modifier.height(35.dp))

            Text(
                text = "Hello, $firstName 👋",
                color = Color.White,
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold)

            )
            Spacer(Modifier.height(8.dp))

            Text(
                text = when (listenState) {
                    ListenState.Idle -> ""
                    ListenState.Listening -> "Listening..."
                    ListenState.Thinking -> "Thinking..."
                    ListenState.Speaking -> "Speaking..."
                    ListenState.Muted -> ""
                },
                style = MaterialTheme.typography.titleMedium.copy(
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold
                )
            )

            Spacer(Modifier.height(20.dp))

            Box(modifier = Modifier.fillMaxHeight(0.4f), contentAlignment = Alignment.Center) {
                val (hasRecordPerm, requestRecordPerm) = rememberRecordAudioPermission {
                    micController.startListening()
                }
                MicVisuals(
                    listenState = listenState,
                    hasRecordPerm = hasRecordPerm.value,
                    onRequestPermission = { requestRecordPerm() },
                    onStartListening = { micController.startListening() },
                    onStopListening = { micController.stopListening() },
                    onUpdateState = {
                        when (it) {
                            ListenState.Muted -> micController.mute()
                            ListenState.Idle -> micController.unmute()
                            else -> {}
                        }
                    }
                )
            }

            Spacer(Modifier.height(12.dp))

            Button(
                onClick = { if (isMuted) micController.unmute() else micController.mute() },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isMuted) Color.Red else Color(0xFF141E30)
                ),
                shape = RoundedCornerShape(50),
                modifier = Modifier.height(48.dp)
            ) {
                Icon(
                    imageVector = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                    contentDescription = "Mute/Unmute",
                    tint = Color.White
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = if (isMuted) "Unmute" else "Mute",
                    color = Color.White
                )
            }


            Spacer(Modifier.height(24.dp))
            if (conversation.isNotEmpty()) ConversationList(
                conversation = conversation,
                listState = listState
            )
            if (conversation.isEmpty()) {
                Spacer(Modifier.weight(1f))
                Text(
                    text = "💡 Tip: Tap the mic icon and say a command",
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                SuggestionSlideshow()
                Spacer(Modifier.height(32.dp))
            }

        }
    }

    DisposableEffect(Unit) { onDispose { ttsManager.shutdown() } }
}
// endregion