package com.example.roommitra.view

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.example.roommitra.MainActivity
import java.util.*

// --- Simple UI state machine for the mic pane ---
enum class ListenState { Idle, Listening, Thinking, Speaking }

@Composable
fun MicPane(
    modifier: Modifier = Modifier,
    onUserInteraction: () -> Unit,
    onFinalUtterance: (String) -> Unit,
    autoListenTrigger: State<Long>
) {
    var listenState by remember { mutableStateOf(ListenState.Idle) }
    var recognizedText by remember { mutableStateOf("") }
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
                override fun onReadyForSpeech(params: Bundle?) { onUserInteraction() }
                override fun onBeginningOfSpeech() { onUserInteraction() }
                override fun onEndOfSpeech() { listenState = ListenState.Thinking }
                override fun onError(error: Int) { listenState = ListenState.Idle }
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        recognizedText = matches[0]
                        onUserInteraction()
                        onFinalUtterance(recognizedText)
                    }
                }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onRmsChanged(rmsdB: Float) {}
            })
        }
        onDispose {
            listenState = ListenState.Idle
            speechRecognizer?.destroy()
        }
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

    // Observe TTS state from MainActivity
    val ttsPlaying by MainActivity.isTtsPlaying

    // Track pending auto-listen requests
    var pendingAutoListen by remember { mutableStateOf(false) }
    LaunchedEffect(autoListenTrigger.value) {
        if (autoListenTrigger.value != 0L) pendingAutoListen = true
    }
    LaunchedEffect(pendingAutoListen, ttsPlaying, listenState) {
        if (pendingAutoListen && !ttsPlaying &&
            listenState != ListenState.Listening && listenState != ListenState.Thinking
        ) {
            if (hasRecordPerm.value) {
                onUserInteraction()
                listenState = ListenState.Listening
                startListening(ctx, speechRecognizer)
            }
            pendingAutoListen = false
        }
    }

    // Update state when TTS starts/stops
    LaunchedEffect(ttsPlaying) {
        if (ttsPlaying) listenState = ListenState.Speaking
        else if (listenState == ListenState.Speaking) listenState = ListenState.Idle
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

        // Big Mic Button
        Box(
            modifier = Modifier.fillMaxWidth().weight(1f),
            contentAlignment = Alignment.Center
        ) {
            when (listenState) {
                ListenState.Idle, ListenState.Listening -> {
                    MicButton(
                        micColor = micColor,
                        pulseScale = pulseScale,
                        onMicClick = {
                            if (!hasRecordPerm.value) {
                                requestPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                return@MicButton
                            }
                            when (listenState) {
                                ListenState.Idle -> {
                                    listenState = ListenState.Listening
                                    startListening(ctx, speechRecognizer)
                                }
                                ListenState.Listening -> {
                                    speechRecognizer?.stopListening()
                                    listenState = ListenState.Idle
                                }
                                else -> {}
                            }
                        }
                    )
                }
                ListenState.Thinking -> ThinkingDots(micColor)
                ListenState.Speaking -> SpeakingBars(micColor)
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
                    if (hasRecordPerm.value) "" else "Mic permission needed",
                    style = small
                )
            }
            Text("Tip: “Hey Mitra…”", style = small, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun MicButton(
    micColor: Color,
    pulseScale: Float,
    onMicClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .size(220.dp)
            .scale(pulseScale)
            .background(micColor.copy(alpha = 0.12f), CircleShape)
            .border(3.dp, micColor, CircleShape)
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() }
            ) { onMicClick() },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Default.Mic,
            contentDescription = "Mic",
            tint = micColor,
            modifier = Modifier.size(96.dp)
        )
    }
}

@Composable
private fun ThinkingDots(micColor: Color) {
    val infiniteTransition = rememberInfiniteTransition(label = "dotsPulse")

    val scale1 by infiniteTransition.animateFloat(
        initialValue = 0.5f, targetValue = 1.2f,
        animationSpec = infiniteRepeatable(tween(600, easing = LinearEasing), RepeatMode.Reverse),
        label = "dot1"
    )
    val scale2 by infiniteTransition.animateFloat(
        initialValue = 0.5f, targetValue = 1.2f,
        animationSpec = infiniteRepeatable(tween(600, delayMillis = 200, easing = LinearEasing), RepeatMode.Reverse),
        label = "dot2"
    )
    val scale3 by infiniteTransition.animateFloat(
        initialValue = 0.5f, targetValue = 1.2f,
        animationSpec = infiniteRepeatable(tween(600, delayMillis = 400, easing = LinearEasing), RepeatMode.Reverse),
        label = "dot3"
    )

    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically, modifier = Modifier.size(96.dp)) {
        Box(Modifier.size(20.dp).scale(scale1).background(micColor, CircleShape))
        Box(Modifier.size(20.dp).scale(scale2).background(micColor, CircleShape))
        Box(Modifier.size(20.dp).scale(scale3).background(micColor, CircleShape))
    }
}

@Composable
private fun SpeakingBars(micColor: Color) {
    val eqPulse = rememberInfiniteTransition()
    val barScale by eqPulse.animateFloat(
        initialValue = 0.4f, targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(450), RepeatMode.Reverse)
    )

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

private fun startListening(ctx: android.content.Context, speechRecognizer: SpeechRecognizer?) {
    val recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
    }
    speechRecognizer?.startListening(recognizerIntent)
}
