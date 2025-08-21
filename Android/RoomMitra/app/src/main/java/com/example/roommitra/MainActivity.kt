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


// --- Simple UI state machine for the mic pane ---
enum class ListenState { Idle, Listening, Thinking }

class MainActivity : ComponentActivity() {

    // 🔴 ADDED: Inactivity handler
    private val dimHandler = Handler(Looper.getMainLooper())
    private val dimRunnable = Runnable {
        setAppBrightness(0.05f) // Dim to 5%
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Keep the screen on while your app is in the foreground
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        // --- KIOSK MODE (Light) START ---
        hideSystemUI()
        // --- KIOSK MODE (Light) END ---

        setContent {
            MaterialTheme {
                Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    RoomMitraHome(onUserInteraction = { resetDimTimer() })
                }
            }
        }
        resetDimTimer()
    }
    // 🔴 ADDED: Control brightness at app-level
    private fun setAppBrightness(level: Float) {
        val lp = window.attributes
        lp.screenBrightness = level // 0.0f (dark) to 1.0f (bright)
        window.attributes = lp
    }

    // 🔴 ADDED: Reset inactivity timer and restore brightness
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
}

@Composable
fun RoomMitraHome(onUserInteraction: () -> Unit) {
    val isLandscape =
        LocalConfiguration.current.orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE

    if (isLandscape) {
        Row(Modifier.fillMaxSize()) {
            MicPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .background(MaterialTheme.colorScheme.surface),
                    onUserInteraction = onUserInteraction
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
                    onUserInteraction = onUserInteraction
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
fun MicPane(modifier: Modifier = Modifier, onUserInteraction: () -> Unit) {
    var listenState by remember { mutableStateOf(ListenState.Idle) }
    var recognizedText by remember { mutableStateOf("") } // NEW
    val ctx = LocalContext.current

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
                    Log.d("RoomMitra", "Ready for speech")
                    onUserInteraction()
                }

                override fun onBeginningOfSpeech() {
                    Log.d("RoomMitra", "Speech started")
                    onUserInteraction()
                }

                override fun onEndOfSpeech() {
                    Log.d("RoomMitra", "Speech ended")
                    listenState = ListenState.Thinking
                }

                override fun onError(error: Int) {

                    val message = when (error) {
                        SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                        SpeechRecognizer.ERROR_CLIENT -> "Client side error"
                        SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
                        SpeechRecognizer.ERROR_NETWORK -> "Network error"
                        SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
                        SpeechRecognizer.ERROR_NO_MATCH -> "No recognition result"
                        SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "RecognitionService busy"
                        SpeechRecognizer.ERROR_SERVER -> "Server error"
                        SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
                        else -> "Unknown error"
                    }
                    Log.e("RoomMitra", "Error: $error ($message)")

//                    Log.e("RoomMitra", "Error: $error")
                    listenState = ListenState.Idle
                }

                override fun onResults(results: Bundle?) {
                    val matches =
                        results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        recognizedText = matches[0]
                        Log.d("RoomMitra", "Heard: $recognizedText")
                        onUserInteraction()
                    }
                    listenState = ListenState.Idle
                }

                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onRmsChanged(rmsdB: Float) {}
            })
        }

        onDispose {
            speechRecognizer?.destroy()
        }
    }

    // Permission launcher for RECORD_AUDIO
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
                // On first grant, you can jump into Listening immediately if user tapped mic.
                listenState = ListenState.Listening
                // TODO: startSTT()
                startListening(ctx, speechRecognizer)
                onUserInteraction()
            }
        }

    // Animated mic color per state
    val targetColor = when (listenState) {
        ListenState.Idle -> MaterialTheme.colorScheme.primary
        ListenState.Listening -> Color(0xFF00C853) // green-ish
        ListenState.Thinking -> Color(0xFFFFA000)  // amber-ish
    }
    val micColor by animateColorAsState(targetValue = targetColor, label = "micColor")

    // Subtle pulsing while Listening
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
//        modifier = modifier.padding(24.dp),
        modifier = modifier
            .padding(24.dp)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onUserInteraction() }, // 🔴 ANY TAP RESETS TIMER
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Header
        Column {
            Text(
                text = "Room Mitra",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = when (listenState) {
                    ListenState.Idle -> "Tap the mic or say your wake word"
                    ListenState.Listening -> "Listening… speak now"
                    ListenState.Thinking -> "Thinking…"
                },
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (recognizedText.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Text("You said: $recognizedText", style = MaterialTheme.typography.bodyLarge)
            }
        }

        // Big Mic Button
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentAlignment = Alignment.Center
        ) {
            val icon = when (listenState) {
                ListenState.Idle, ListenState.Listening -> Icons.Default.Mic
                ListenState.Thinking -> Icons.Default.GraphicEq
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
                        // Tap logic:
                        onUserInteraction()
                        if (!hasRecordPerm.value) {
                            requestPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                            return@clickable
                        }
                        when (listenState) {
                            ListenState.Idle -> {
                                listenState = ListenState.Listening
                                startListening(ctx, speechRecognizer) // NEW
                                // TODO: startSTT()
                            }
                            ListenState.Listening -> {
                                listenState = ListenState.Thinking
                                speechRecognizer?.stopListening()
                                // TODO: stopSTT(); sendTextToLLM(); on response -> TTS and back to Idle
                            }
                            ListenState.Thinking -> {
                                // Ignore or allow cancel:
                                listenState = ListenState.Idle
                                // TODO: cancel in-flight if needed
                            }
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = "Mic",
                    tint = micColor,
                    modifier = Modifier.size(96.dp)
                )
            }
        }

        // Bottom controls / hints
        Row(
            Modifier
                .fillMaxWidth()
                .defaultMinSize(minHeight = 64.dp),
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
//@OptIn(ExperimentalFoundationApi::class)
@Composable
fun WidgetsPane(modifier: Modifier = Modifier, onUserInteraction: () -> Unit) {
    val cards = remember {
        listOf(
            WidgetCard("Restaurant Menu", "Explore today’s specials") { /* TODO */ },
            WidgetCard("Housekeeping", "Towels, cleaning, water") { /* TODO */ },
            WidgetCard("Concierge", "Cabs, attractions, tips") { /* TODO */ },
            WidgetCard("Request Status", "Track your requests") { /* TODO */ },
            WidgetCard("Entertainment", "YouTube / OTT (curated)") { /* TODO */ },
            WidgetCard("Amenities", "Pool timings, spa, walks") { /* TODO */ },
        )
    }

    Column(modifier = modifier.padding(24.dp)) {
        Text(
            text = "Quick Actions",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(Modifier.height(12.dp))

        // 2xN grid of cards that scale on tablets
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
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1.6f)
                ) {
                    Column(
                        Modifier
                            .padding(16.dp)
                            .fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(card.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text(card.subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

data class WidgetCard(
    val title: String,
    val subtitle: String,
    val onClick: () -> Unit
)
