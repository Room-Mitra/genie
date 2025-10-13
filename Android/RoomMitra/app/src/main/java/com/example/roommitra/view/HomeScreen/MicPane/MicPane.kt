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
import androidx.compose.animation.core.*
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
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
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
        _listenState.value = state
    }

    fun mute() {
        _isMuted.value = true
        _listenState.value = ListenState.Muted
    }

    fun unmute() {
        _isMuted.value = false
        _listenState.value = ListenState.Idle
    }

    fun reset() {
        _listenState.value = ListenState.Idle
        _isMuted.value = false
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

                tts?.setOnUtteranceProgressListener(object :
                    android.speech.tts.UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        isPlaying.value = true
                    }

                    override fun onDone(utteranceId: String?) {
                        isPlaying.value = false
                    }

                    override fun onError(utteranceId: String?) {
                        isPlaying.value = false
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
        } catch (e: Exception) {
            Log.e("TtsManager", "speak() error: ${e.message}")
        }
    }

    fun stopImmediately() {
        tts?.stop()
        isPlaying.value = false
    }

    fun shutdown() {
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
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onEndOfSpeech() {
                    micStateService.setState(ListenState.Thinking)
                }

                override fun onError(error: Int) {
                    micStateService.setState(ListenState.Idle)
                    isListening = false
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) onFinalUtterance(matches[0])
                    isListening = false
                }

                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onRmsChanged(rmsdB: Float) {}
            })
        }
    }

    fun startListening() {
        if (isListening || micStateService.isMuted.value) return
        micStateService.setState(ListenState.Listening)
        isListening = true
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }
        speechRecognizer?.startListening(intent)
    }

    fun stopListening() {
        if (!isListening) return
        speechRecognizer?.stopListening()
        micStateService.setState(ListenState.Idle)
        isListening = false
    }

    fun mute() {
        micStateService.mute()
        ttsManager.stopImmediately()
        stopListening()
    }

    fun unmute() = micStateService.unmute()

    fun dispose() {
        speechRecognizer?.destroy()
        speechRecognizer = null
        micStateService.reset()
        isListening = false
    }

    suspend fun autoClearConversationAfter(delayMillis: Long = 60_000L) {
        if (conversation.isNotEmpty()) {
            kotlinx.coroutines.delay(delayMillis)
            conversation.clear()
            if (!micStateService.isMuted.value) onSessionReset()
        }
    }

    fun onTtsStateChanged(ttsPlaying: Boolean) {
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
        MicController(ctx, micStateService, onFinalUtterance, ttsManager, conversation, onSessionReset)
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
            micStateService.listenState.value !in listOf(ListenState.Listening, ListenState.Thinking, ListenState.Muted)
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
fun MicPane(modifier: Modifier = Modifier, navController: NavHostController) {
    val ctx = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val apiService = remember { ApiService(ctx) }
    val conversation = remember { mutableStateListOf<ConversationMessage>() }
    val autoListenTrigger = remember { mutableStateOf(0L) }
    val ttsManager = remember { TtsManager(ctx) }
    var sessionId by remember { mutableStateOf(UUID.randomUUID().toString()) }

    val sessionReset: () -> Unit = { sessionId = UUID.randomUUID().toString() }

    fun sendUtteranceToServer(userQuery: String) {
        coroutineScope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val payload = JSONObject().apply {
                        put("userQuery", userQuery)
                        put("sessionId", sessionId)
                    }
                    when (val result = apiService.post("utterance", payload)) {
                        is ApiResult.Success -> {
                            val json = result.data
                            val speech = json?.optString("speech", "") ?: ""
                            val isSessionOpen = json?.optBoolean("isSessionOpen", false) ?: false

                            if (speech.isNotEmpty()) {
                                conversation.add(ConversationMessage(speech, false))
                                ttsManager.speak(speech)
                            } else ttsManager.speak("No response from server.")

                            if (isSessionOpen)
                                autoListenTrigger.value = System.currentTimeMillis()
                        }
                        is ApiResult.Error -> ttsManager.speak("Something went wrong. Please try later")
                    }
                } catch (e: Exception) {
                    ttsManager.speak("Something went wrong. Please try later")
                }
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
            Spacer(Modifier.height(8.dp))

            Text(
                text = when (listenState) {
                    ListenState.Idle -> "Tap the mic or say your wake word"
                    ListenState.Listening -> "Listening..."
                    ListenState.Thinking -> "Thinking..."
                    ListenState.Speaking -> "Speaking..."
                    ListenState.Muted -> "Muted"
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
            if (conversation.isNotEmpty()) ConversationList(conversation = conversation, listState = listState)

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

    DisposableEffect(Unit) { onDispose { ttsManager.shutdown() } }
}
// endregion
