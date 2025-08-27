package com.example.roommitra

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import android.content.Intent
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import java.util.Locale
import android.view.View
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import java.util.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import androidx.compose.ui.draw.rotate


// --- Simple UI state machine for the mic pane ---
enum class ListenState { Idle, Listening, Thinking, Speaking }

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {

    //  Inactivity handler
    private val dimHandler = Handler(Looper.getMainLooper())
    private val dimRunnable = Runnable {
        setAppBrightness(0.05f) // Dim to 5%
    }

    // --- TTS and Session Management ---
    private lateinit var tts: TextToSpeech
    private var sessionId: String = UUID.randomUUID().toString()
    private val deviceId: String = "RoomMitraDevice-001"
    // Make the TTS-playing flag observable by Compose UI.
    // `mutableStateOf` is a Compose runtime container; Composables can read it and recompose
    companion object {
        val isTtsPlaying = mutableStateOf(false)
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Keep the screen on while your app is in the foreground
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        // --- KIOSK MODE (Light) START ---
        hideSystemUI()
        // --- KIOSK MODE (Light) END ---

        tts = TextToSpeech(this, this)

        setContent {
            MaterialTheme {
                Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    RoomMitraHome(
                        onUserInteraction = { resetDimTimer() },
                        onFinalUtterance = { userQuery ->
                            sendUtteranceToServer(userQuery)
                        }
                    )
                }
            }
        }
        resetDimTimer()
    }

    //Control brightness at app-level
    private fun setAppBrightness(level: Float) {
        val lp = window.attributes
        lp.screenBrightness = level // 0.0f (dark) to 1.0f (bright)
        window.attributes = lp
    }

    // Reset inactivity timer and restore brightness
    private fun resetDimTimer() {
        dimHandler.removeCallbacks(dimRunnable)
        setAppBrightness(1.0f) // Restore full brightness
        dimHandler.postDelayed(dimRunnable, 2 * 60 * 1000) // 2 minutes
    }
    // --- KIOSK MODE: Hides navigation & status bar ---
    private fun hideSystemUI() {
        window.decorView.systemUiVisibility =
            (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE)
    }

    // --- KIOSK MODE: Re-apply when window regains focus ---
    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    // --- KIOSK MODE: Disable back button ---
    override fun onBackPressed() {
        // Do nothing to prevent exiting
    }

    // --- TTS setup ---
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            Log.d("TTS", "Using voice: ${tts.voices.filter { it.name.contains("en-in", ignoreCase = true) }}")
            // Try to find a natural Indian English female voice
//            val selectedVoice = tts.voices?.find {
//                it.name.contains("en-in", ignoreCase = true) &&
//                        it.name.contains("female", ignoreCase = true)
//            }
            val selectedVoice = tts.voices?.find {
                it.name.contains("en-in", ignoreCase = true) &&
                        it.name.contains("en-in-x-ena-local", ignoreCase = true)
            }
            if (selectedVoice != null) {
                tts.voice = selectedVoice
                Log.d("TTS", "Using voice: ${selectedVoice.name}")
            } else {
                // fallback if no fancy voice is found
                tts.language = Locale("en", "IN")
            }
            // after you pick/set voice or language, add this:
            tts.setOnUtteranceProgressListener(object : android.speech.tts.UtteranceProgressListener() {
                // Called when the TTS engine starts speaking the utterance
                override fun onStart(utteranceId: String?) {
                    // UtteranceProgressListener callbacks may be on a non-UI thread,
                    // so post the state change to the main thread.
                    this@MainActivity.runOnUiThread {
                        isTtsPlaying.value = true
                    }
                }

                // Called when utterance finishes
                override fun onDone(utteranceId: String?) {
                    this@MainActivity.runOnUiThread {
                        isTtsPlaying.value = false
                    }
                }

                // Called on error for that utterance
                override fun onError(utteranceId: String?) {
                    this@MainActivity.runOnUiThread {
                        isTtsPlaying.value = false
                    }
                }
            })

        }
    }

    override fun onDestroy() {
        super.onDestroy()
        tts.stop()
        tts.shutdown()
    }

    // --- Send speech utterance to API ---
    private fun sendUtteranceToServer(userQuery: String) {
        val client = OkHttpClient()

        val json = JSONObject().apply {
            put("userQuery", userQuery)
            put("sessionId", sessionId)
            put("deviceId", deviceId)
        }

        val body = RequestBody.create(
            "application/json; charset=utf-8".toMediaTypeOrNull(),
            json.toString()
        )

        val request = Request.Builder()
            .url("http://192.168.1.4:3000/utterance") // localhost for emulator
            .addHeader(
                "authorization",
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaG90ZWxJZCI6IlJvb20gR2VuaWUiLCJpYXQiOjE3NTYyNzEzMDEsImV4cCI6MTc1NzEzNTMwMX0.k1G6tUeL_Q_mDND5Vsa657HqGKXJEQEvbWb0o--dPMI"
            )
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("RoomMitra", "API call failed: ${e.message}")
                val utteranceId = UUID.randomUUID().toString()
                // Speak from the main thread so UtteranceProgressListener and UI updates work properly
                this@MainActivity.runOnUiThread {
                    tts.speak("Something went wrong. Please try after some time",
                        TextToSpeech.QUEUE_ADD,
                        null,
                        utteranceId)
                }
            }


            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!response.isSuccessful) {
                        Log.e("RoomMitra", "Unexpected code $response")
                        return
                    }
                    val responseBody = response.body?.string()
                    if (responseBody != null) {
                        val jsonResp = JSONObject(responseBody)
                        val speech = jsonResp.optString("speech", "")
                        val isSessionOpen = jsonResp.optBoolean("isSessionOpen", false)

                        if (speech.isNotEmpty()) {
                            val utteranceId = UUID.randomUUID().toString()
                            this@MainActivity.runOnUiThread {
                                tts.speak(speech, TextToSpeech.QUEUE_ADD, null, utteranceId)
                            }
                        }
                        if (!isSessionOpen) {
                            sessionId = UUID.randomUUID().toString()
                        }
                    }
                }
            }
        })
    }
}

@Composable
fun RoomMitraHome(onUserInteraction: () -> Unit, onFinalUtterance: (String) -> Unit) {
    val isLandscape =
        LocalConfiguration.current.orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE

    if (isLandscape) {
        Row(Modifier.fillMaxSize()) {
            MicPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .background(MaterialTheme.colorScheme.surface),
                onUserInteraction = onUserInteraction,
                onFinalUtterance = onFinalUtterance
            )
            WidgetsPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                onUserInteraction = onUserInteraction
            )
        }
    } else {
        Column(Modifier.fillMaxSize()) {
            MicPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface),
                onUserInteraction = onUserInteraction,
                onFinalUtterance = onFinalUtterance
            )
            WidgetsPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                onUserInteraction = onUserInteraction
            )
        }
    }
}

@Composable
fun MicPane(
    modifier: Modifier = Modifier,
    onUserInteraction: () -> Unit,
    onFinalUtterance: (String) -> Unit
) {
    var listenState by remember { mutableStateOf(ListenState.Idle) }
    var recognizedText by remember { mutableStateOf("") }
    val ctx = LocalContext.current


    // Observe the TTS playing flag set by MainActivity's UtteranceProgressListener
    val ttsPlaying by MainActivity.isTtsPlaying

// If TTS starts, switch UI state to Speaking; when TTS stops, revert to Idle only if we set it.
    LaunchedEffect(ttsPlaying) {
        if (ttsPlaying) {
            listenState = ListenState.Speaking
        } else {
            // only reset to Idle if it was the Speaking state
            if (listenState == ListenState.Speaking) {
                listenState = ListenState.Idle
            }
        }
    }


    // --- SpeechRecognizer setup ---
    val speechRecognizer = remember {
        if (SpeechRecognizer.isRecognitionAvailable(ctx)) {
            SpeechRecognizer.createSpeechRecognizer(ctx)
        } else null
    }
    // Attach listener
    DisposableEffect(Unit) {
        if (speechRecognizer != null) {
            speechRecognizer.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    onUserInteraction()
                }
                override fun onBeginningOfSpeech() {
                    onUserInteraction()
                }
                override fun onEndOfSpeech() {
                    listenState = ListenState.Thinking
                }
                override fun onError(error: Int) {
                    listenState = ListenState.Idle
                }
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        recognizedText = matches[0]
                        onUserInteraction()
                        onFinalUtterance(recognizedText) // 🔴 send to API
                    }
//                    listenState = ListenState.Idle
                }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onRmsChanged(rmsdB: Float) {}
            })
        }
        onDispose { speechRecognizer?.destroy() }
    }

    // Permission handling
    val hasRecordPerm = remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.RECORD_AUDIO) ==
                    PackageManager.PERMISSION_GRANTED
        )
    }
    val requestPermissionLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            hasRecordPerm.value = granted
            if (granted) {
                listenState = ListenState.Listening
                startListening(ctx, speechRecognizer)
                onUserInteraction()
            }
        }

    // Animated mic color per state
    val targetColor = when (listenState) {
        ListenState.Idle -> MaterialTheme.colorScheme.primary
        ListenState.Listening -> Color(0xFF00C853)
        ListenState.Thinking -> Color(0xFFFFA000)
        ListenState.Speaking -> Color(0xFF00C853)
    }
    val micColor by animateColorAsState(targetValue = targetColor, label = "micColor")

    val pulse = rememberInfiniteTransition(label = "pulse")
    val pulseScale by pulse.animateFloat(
        initialValue = 1.0f,
        targetValue = if (listenState == ListenState.Listening) 1.08f else 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Column(
        modifier = modifier
            .padding(24.dp)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onUserInteraction() },
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Header
        Column {
            Text("Room Mitra", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(
                text = when (listenState) {
                    ListenState.Idle -> "Tap the mic or say your wake word"
                    ListenState.Listening -> "Listening… speak now"
                    ListenState.Thinking -> "Thinking…"
                    ListenState.Speaking -> "Speaking…"
                },
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (recognizedText.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Text("You said: $recognizedText", style = MaterialTheme.typography.bodyLarge)
            }
        }

        // Create a small eq-style pulse while TTS is playing:
        val eqPulse = rememberInfiniteTransition()
        val barScale by eqPulse.animateFloat(
            initialValue = 0.4f, targetValue = 1f,
            animationSpec = infiniteRepeatable(tween(450), RepeatMode.Reverse)
        )

        // Big Mic Button
        Box(
            modifier = Modifier.fillMaxWidth().weight(1f),
            contentAlignment = Alignment.Center
        ) {
            val icon = when (listenState) {
                ListenState.Idle, ListenState.Listening -> Icons.Default.Mic
                ListenState.Thinking -> Icons.Default.GraphicEq
                else -> Icons.Default.Mic
            }
            Box(
                modifier = Modifier
                    .size(220.dp)
                    .scale(pulseScale)
                    .background(micColor.copy(alpha = 0.12f), CircleShape)
                    .border(3.dp, micColor, CircleShape)
                    .clickable(
                        indication = null,
                        interactionSource = remember { MutableInteractionSource() }
                    ) {
                        onUserInteraction()
                        if (!hasRecordPerm.value) {
                            requestPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                            return@clickable
                        }
                        when (listenState) {
                            ListenState.Idle -> {
                                listenState = ListenState.Listening
                                startListening(ctx, speechRecognizer)
                            }
                            ListenState.Listening -> {
                                listenState = ListenState.Thinking
                                speechRecognizer?.stopListening()
                            }
                            ListenState.Thinking -> {
                                listenState = ListenState.Speaking
                            }
                            ListenState.Speaking -> {
                                listenState = ListenState.Idle
                            }
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
//                Icon(imageVector = icon, contentDescription = "Mic", tint = micColor, modifier = Modifier.size(96.dp))
            }
            when (listenState) {
                ListenState.Idle, ListenState.Listening -> {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Mic",
                        tint = micColor,
                        modifier = Modifier.size(96.dp)
                    )
                }
                ListenState.Thinking -> {
                    // Add rotation animation while thinking
                    val rotation by rememberInfiniteTransition(label = "thinkingRotation")
                        .animateFloat(
                            initialValue = 0f,
                            targetValue = 360f,
                            animationSpec = infiniteRepeatable(
                                tween(durationMillis = 1200, easing = LinearEasing),
                                RepeatMode.Restart
                            ),
                            label = "rotateAnim"
                        )

                    Icon(
                        imageVector = Icons.Default.GraphicEq,
                        contentDescription = "Thinking",
                        tint = micColor,
                        modifier = Modifier
                            .size(96.dp)
                            .rotate(rotation) // 🔥 rotation effect
                    )
                }
                ListenState.Speaking -> {
                    // Animated bars instead of mic
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        repeat(3) {
                            Box(
                                Modifier
                                    .size(20.dp, (50 * barScale).dp)
                                    .background(micColor, RoundedCornerShape(4.dp))
                            )
                        }
                    }
                }
            }
        }

        // Bottom controls
        Row(
            Modifier.fillMaxWidth().defaultMinSize(minHeight = 64.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            val small = MaterialTheme.typography.bodyMedium
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = if (hasRecordPerm.value) Icons.Default.Mic else Icons.Default.MicOff,
                    contentDescription = null,
                    tint = if (hasRecordPerm.value) MaterialTheme.colorScheme.primary else Color.Red
                )
                Spacer(Modifier.size(8.dp))
                Text(
                    if (hasRecordPerm.value) "Mic permission granted" else "Mic permission needed",
                    style = small
                )
            }
            Text("Tip: “Hey Mitra…”", style = small, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

private fun startListening(ctx: android.content.Context, speechRecognizer: SpeechRecognizer?) {
    val recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
    }
    speechRecognizer?.startListening(recognizerIntent)
}

@Composable
fun WidgetsPane(modifier: Modifier = Modifier, onUserInteraction: () -> Unit) {
    val cards = remember {
        listOf(
            WidgetCard("Restaurant Menu", "Explore today’s specials") { },
            WidgetCard("Housekeeping", "Towels, cleaning, water") { },
            WidgetCard("Concierge", "Cabs, attractions, tips") { },
            WidgetCard("Request Status", "Track your requests") { },
            WidgetCard("Entertainment", "YouTube / OTT (curated)") { },
            WidgetCard("Amenities", "Pool timings, spa, walks") { },
        )
    }

    Column(modifier = modifier.padding(24.dp)) {
        Text("Quick Actions", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(12.dp))
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(cards) { card ->
                Card(
                    onClick = card.onClick,
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth().aspectRatio(1.6f)
                ) {
                    Column(
                        Modifier.padding(16.dp).fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(card.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(card.subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

data class WidgetCard(val title: String, val subtitle: String, val onClick: () -> Unit)
