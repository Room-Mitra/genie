package com.example.roommitra.view

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.roommitra.ConversationMessage
import com.example.roommitra.MainActivity
import com.example.roommitra.R
import kotlinx.coroutines.delay
import java.util.*

enum class ListenState { Idle, Listening, Thinking, Speaking, Muted }
//data class ConversationMessage(val text: String, val isUser: Boolean)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MicPane(
    modifier: Modifier = Modifier,
    onFinalUtterance: (String) -> Unit,
    autoListenTrigger: State<Long>
) {
    var listenState by remember { mutableStateOf(ListenState.Idle) }
    val ctx = LocalContext.current
//    val conversation = remember { mutableStateListOf<ConversationMessage>() }
    val listState = rememberLazyListState()
    val conversation = MainActivity.conversation


    val speechRecognizer = remember {
        if (SpeechRecognizer.isRecognitionAvailable(ctx)) {
            SpeechRecognizer.createSpeechRecognizer(ctx)
        } else null
    }

    DisposableEffect(Unit) {
        if (speechRecognizer != null) {
            speechRecognizer.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onEndOfSpeech() { listenState = ListenState.Thinking }
                override fun onError(error: Int) { listenState = ListenState.Idle }
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        conversation.add(ConversationMessage(matches[0], true))
                        onFinalUtterance(matches[0])
                    }
                }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onRmsChanged(rmsdB: Float) {}
            })
        }
        onDispose { speechRecognizer?.destroy(); listenState = ListenState.Idle }
    }

    val hasRecordPerm = remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.RECORD_AUDIO) ==
                    PackageManager.PERMISSION_GRANTED
        )
    }

    val requestPermissionLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            hasRecordPerm.value = granted
            if (granted) listenState = ListenState.Listening
        }

    val ttsPlaying by MainActivity.isTtsPlaying
    var pendingAutoListen by remember { mutableStateOf(false) }

    LaunchedEffect(autoListenTrigger.value) {
        if (autoListenTrigger.value != 0L) pendingAutoListen = true
    }

    LaunchedEffect(pendingAutoListen, ttsPlaying, listenState) {
        if (pendingAutoListen && !ttsPlaying &&
            listenState != ListenState.Listening && listenState != ListenState.Thinking &&
            listenState != ListenState.Muted
        ) {
            if (hasRecordPerm.value) {
                listenState = ListenState.Listening
                startListening(ctx, speechRecognizer)
            }
            pendingAutoListen = false
        }
    }

    LaunchedEffect(ttsPlaying) {
        if (ttsPlaying && listenState != ListenState.Muted) {
            listenState = ListenState.Speaking
        } else if (listenState == ListenState.Speaking) {
            listenState = ListenState.Idle
        }
    }

    // 🔹 Auto-clear conversation if no new message in 2 minutes
    LaunchedEffect(conversation.size) {
        if (conversation.isNotEmpty()) {
            delay(1 * 60 * 1000L) // 2 minutes
            conversation.clear()
        }
    }

    val micColor by animateColorAsState(
        when (listenState) {
            ListenState.Listening -> MaterialTheme.colorScheme.primary
            ListenState.Thinking -> MaterialTheme.colorScheme.tertiary
            ListenState.Speaking -> MaterialTheme.colorScheme.secondary
            ListenState.Muted -> Color.Gray
            else -> MaterialTheme.colorScheme.outline
        }
    )

    val pulseScale: Float = when (listenState) {
        ListenState.Listening -> {
            val transition = rememberInfiniteTransition(label = "pulse")
            transition.animateFloat(
                initialValue = 1f,
                targetValue = 1.15f,
                animationSpec = infiniteRepeatable(
                    animation = tween(900, easing = LinearEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "pulseAnim"
            ).value
        }
        else -> 1f
    }


    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(Color(0xFF141E30), Color(0xFF243B55))
                )
            )
            .padding(16.dp)
    ) {
        val suggestionsVisible = true
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = if (suggestionsVisible) Arrangement.Center else Arrangement.Top
        ) {
            // Header
            Image(
                painter = painterResource(R.drawable.goldlogo),
                contentDescription = "Room Mitra Logo",
                modifier = Modifier
                    .height(64.dp)
                    .padding(top = 12.dp),
                contentScale = ContentScale.Fit
            )
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

            // Mic Control
            Box(modifier = Modifier.fillMaxHeight(0.4f), contentAlignment = Alignment.Center) {
                MicControl(
                    listenState = listenState,
                    micColor = micColor,
                    pulseScale = pulseScale * 2f,
                    hasRecordPerm = hasRecordPerm.value,
                    onRequestPermission = { requestPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO) },
                    onStartListening = { startListening(ctx, speechRecognizer) },
                    onStopListening = { speechRecognizer?.stopListening() },
                    onUpdateState = { newState ->
                        if (newState == ListenState.Muted) {
                            MainActivity.stopTtsImmediately()
                            speechRecognizer?.stopListening()
                        }
                        listenState = newState
                    }
                )
            }

            Spacer(Modifier.height(12.dp))

            // 🔹 Dedicated Mute/Unmute button
            Button(
                onClick = {
                    if (listenState == ListenState.Muted) {
                        listenState = ListenState.Idle
                    } else {
                        listenState = ListenState.Muted
                        MainActivity.stopTtsImmediately()
                        speechRecognizer?.stopListening()
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (listenState == ListenState.Muted) Color.Red else Color(0xFF141E30)
                ),
                shape = RoundedCornerShape(50),
                modifier = Modifier.height(48.dp)
            ) {
                Icon(
                    imageVector = if (listenState == ListenState.Muted) Icons.Default.MicOff else Icons.Default.Mic,
                    contentDescription = "Mute/Unmute",
                    tint = Color.White
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = if (listenState == ListenState.Muted) "Unmute" else "Mute",
                    color = Color.White
                )
            }

            Spacer(Modifier.height(24.dp))

            // Conversation
            if (conversation.isNotEmpty()) {
                ConversationList(
                    conversation = conversation,
                    listState = listState
                )
            }

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

@Composable
private fun MicControl(
    listenState: ListenState,
    micColor: Color,
    pulseScale: Float,
    hasRecordPerm: Boolean,
    onRequestPermission: () -> Unit,
    onStartListening: () -> Unit,
    onStopListening: () -> Unit,
    onUpdateState: (ListenState) -> Unit
) {
    Box(contentAlignment = Alignment.Center) {
        when (listenState) {
            ListenState.Idle, ListenState.Listening -> {
                MicButton(micColor, pulseScale) {
                    if (!hasRecordPerm) {
                        onRequestPermission()
                        return@MicButton
                    }
                    when (listenState) {
                        ListenState.Idle -> { onUpdateState(ListenState.Listening); onStartListening() }
                        ListenState.Listening -> { onStopListening(); onUpdateState(ListenState.Idle) }
                        else -> {}
                    }
                }
            }
            ListenState.Thinking -> ThinkingDots(micColor)
            ListenState.Speaking -> SpeakingBars(micColor)
            ListenState.Muted -> MicButton(micColor, 1f) {
                // Just inform muted, no action
            }
        }
    }
}

@Composable
private fun MicButton(micColor: Color, pulseScale: Float, onMicClick: () -> Unit) {
    Box(contentAlignment = Alignment.Center) {
//        if (pulseScale > 1f) WaveAnimation(micColor)
        if (pulseScale > 1f && micColor != MaterialTheme.colorScheme.outline) {
            WaveAnimation(micColor)
        }
        Box(
            modifier = Modifier
                .size(100.dp)
                .scale(pulseScale)
                .background(Color.Transparent, CircleShape)
                .border(4.dp, micColor.copy(alpha = 0.8f), CircleShape)
                .clickable(
                    indication = null,
                    interactionSource = remember { MutableInteractionSource() }
                ) { onMicClick() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (micColor == Color.Gray) Icons.Default.MicOff else Icons.Default.Mic,
                contentDescription = "Mic",
                tint = micColor,
                modifier = Modifier.size(48.dp)
            )
        }
    }
}
//
//@Composable
//private fun MicControl(
//    listenState: ListenState,
//    micColor: Color,
//    pulseScale: Float,
//    hasRecordPerm: Boolean,
//    onRequestPermission: () -> Unit,
//    onStartListening: () -> Unit,
//    onStopListening: () -> Unit,
//    onUpdateState: (ListenState) -> Unit
//) {
//    Box(contentAlignment = Alignment.Center) {
//        when (listenState) {
//            ListenState.Idle, ListenState.Listening -> {
//                MicButton(micColor, pulseScale) {
//                    if (!hasRecordPerm) {
//                        onRequestPermission()
//                        return@MicButton
//                    }
//                    when (listenState) {
//                        ListenState.Idle -> { onUpdateState(ListenState.Listening); onStartListening() }
//                        ListenState.Listening -> { onStopListening(); onUpdateState(ListenState.Idle) }
//                        else -> {}
//                    }
//                }
//            }
//            ListenState.Thinking -> ThinkingDots(micColor)
//            ListenState.Speaking -> SpeakingBars(micColor)
//            ListenState.Muted -> MicButton(micColor, 1f) {
//                // Unmute -> go back to Idle
//                onUpdateState(ListenState.Idle)
//            }
//        }
//    }
//}

//@Composable
//private fun MicButton(micColor: Color, pulseScale: Float, onMicClick: () -> Unit) {
//    Box(contentAlignment = Alignment.Center) {
//        if (pulseScale > 1f) WaveAnimation(micColor)
//        Box(
//            modifier = Modifier
//                .size(100.dp)
//                .scale(pulseScale)
//                .background(Color.Transparent, CircleShape)
//                .border(4.dp, micColor.copy(alpha = 0.8f), CircleShape)
//                .clickable(
//                    indication = null,
//                    interactionSource = remember { MutableInteractionSource() }
//                ) { onMicClick() },
//            contentAlignment = Alignment.Center
//        ) {
//            Icon(
//                imageVector = if (micColor == Color.Gray) Icons.Default.MicOff else Icons.Default.Mic,
//                contentDescription = "Mic",
//                tint = micColor,
//                modifier = Modifier.size(48.dp)
//            )
//        }
//    }
//}


@Composable
private fun WaveAnimation(color: Color) {
    val transition = rememberInfiniteTransition(label = "wave")
    val scale by transition.animateFloat(
        initialValue = 1f,
        targetValue = 2.5f,
        animationSpec = infiniteRepeatable(
            tween(1500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "scale"
    )
    val alpha by transition.animateFloat(
        initialValue = 0.4f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            tween(1500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "alpha"
    )

    Box(
        modifier = Modifier
            .size(120.dp)
            .scale(scale)
            .background(color.copy(alpha = alpha), CircleShape)
    )
}

@Composable
private fun SuggestionSlideshow() {
    val suggestions = listOf(
        "Get me a cup of masala chai",
        "Inform housekeeping to clean my room",
        "Where is the library",
        "Suggest a good night club in this city"
    )

    var currentIndex by remember { mutableStateOf(0) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(3000) // change every 3 seconds
            currentIndex = (currentIndex + 1) % suggestions.size
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(120.dp)
            .background(
                Color.White.copy(alpha = 0.08f),
                RoundedCornerShape(20.dp)
            )
            .border(
                1.dp,
                Color.White.copy(alpha = 0.15f),
                RoundedCornerShape(20.dp)
            )
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        AnimatedContent(
            targetState = currentIndex,
            transitionSpec = {
                (slideInVertically { height -> height } + fadeIn() togetherWith
                        slideOutVertically { height -> -height } + fadeOut())
                    .using(SizeTransform(clip = false))
            },
            label = "suggestions"
        ) { index ->
            Text(
                text = suggestions[index],
                color = Color.White,
                fontSize = 18.sp,
                textAlign = TextAlign.Center,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }
    }
}
@Composable
private fun ConversationList(
    conversation: List<ConversationMessage>,
    listState: androidx.compose.foundation.lazy.LazyListState
) {
    LazyColumn(
        state = listState,
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(12.dp)
            .background(
                Color.White.copy(alpha = 0.05f),
                RoundedCornerShape(20.dp)
            )
            .border(
                1.dp,
                Color.White.copy(alpha = 0.12f),
                RoundedCornerShape(20.dp)
            )
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(conversation) { message ->

            val alignment = if (message.isUser) Alignment.CenterEnd else Alignment.CenterStart

            // Bubble gradients
            val bubbleColors = if (message.isUser) {
                Brush.horizontalGradient(
                    listOf(Color(0xFF141E30), Color(0xFF243B55))
                )
            } else {
                Brush.horizontalGradient(
                    listOf(Color(0xFF243B55), Color(0xFF141E30))
                )
            }

            // Animate appearance
            AnimatedVisibility(
                visible = true,
                enter = androidx.compose.animation.fadeIn(
                    animationSpec = tween(400)
                ) + androidx.compose.animation.expandHorizontally(),
                exit = androidx.compose.animation.fadeOut()
            ) {
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = alignment
                ) {
                    Text(
                        text = message.text,
                        color = if (message.isUser) Color.Gray else MaterialTheme.colorScheme.surface,
//                        color = if (message.isUser) Color.Gray else Color(0xFFFAFAFA),
                        modifier = Modifier
                            .shadow(8.dp, RoundedCornerShape(18.dp))
                            .background(bubbleColors, RoundedCornerShape(18.dp))
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                            .widthIn(max = 280.dp),
                        fontSize = 16.sp,
                        lineHeight = 20.sp,
                        textAlign = if (message.isUser) TextAlign.End else TextAlign.Start
                    )
                }
            }
        }
    }

    // Auto-scroll to the latest message
    LaunchedEffect(conversation.size) {
        if (conversation.isNotEmpty()) {
            listState.animateScrollToItem(conversation.size - 1)
        }
    }
}



@Composable
private fun ThinkingDots(micColor: Color) {
    val transition = rememberInfiniteTransition()
    val scale1 by transition.animateFloat(0.5f, 1.2f, infiniteRepeatable(tween(600), RepeatMode.Reverse))
    val scale2 by transition.animateFloat(0.5f, 1.2f, infiniteRepeatable(tween(600, delayMillis = 200), RepeatMode.Reverse))
    val scale3 by transition.animateFloat(0.5f, 1.2f, infiniteRepeatable(tween(600, delayMillis = 400), RepeatMode.Reverse))

    Row(
        modifier = Modifier.height(120.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(Modifier.size(12.dp).scale(scale1).background(micColor, CircleShape))
        Box(Modifier.size(12.dp).scale(scale2).background(micColor, CircleShape))
        Box(Modifier.size(12.dp).scale(scale3).background(micColor, CircleShape))
    }
}

@Composable
private fun SpeakingBars(micColor: Color) {
    val transition = rememberInfiniteTransition()

    Row(
        modifier = Modifier.height(120.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        repeat(3) { i ->
            val scale by transition.animateFloat(
                initialValue = 0.4f,
                targetValue = 1f,
                animationSpec = infiniteRepeatable(
                    tween(450, delayMillis = i * 150),
                    RepeatMode.Reverse
                )
            )

            Box(
                Modifier
                    .width(12.dp)
                    .height((30 * scale).dp)
                    .background(micColor, RoundedCornerShape(4.dp))
            )
        }
    }
}

private fun startListening(ctx: android.content.Context, speechRecognizer: SpeechRecognizer?) {
    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
    }
    speechRecognizer?.startListening(intent)
}
