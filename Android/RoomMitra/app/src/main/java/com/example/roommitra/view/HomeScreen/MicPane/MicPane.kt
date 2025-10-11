package com.example.roommitra.view

import androidx.compose.animation.animateColorAsState
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.example.roommitra.MainActivity
import com.example.roommitra.service.*

/**
 * MicPane
 * -------
 * This is the main composable for the voice interaction screen.
 * It visually represents the current listening/speaking state, microphone UI,
 * conversation history, mute controls, and auto-listening feedback.
 *
 * All voice-related logic is delegated to [MicController], which this pane observes.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MicPane(
    modifier: Modifier = Modifier,
    onFinalUtterance: (String) -> Unit,        // Callback invoked when speech is finalized
    autoListenTrigger: State<Long>,            // External trigger to auto-start listening
    navController: NavHostController           // For navigation to other screens
) {
    // Initialize controller (handles speech recognition + state updates)
    val micController = rememberMicController(onFinalUtterance, autoListenTrigger)

    // UI-related state
    val listState = rememberLazyListState()
    val conversation = micController.conversation
    val listenState = micController.listenState

    /**
     * Animate microphone color based on current listening state.
     * Each state maps to a distinct theme color for visual feedback.
     */
    val micColor by animateColorAsState(
        when (listenState) {
            ListenState.Listening -> MaterialTheme.colorScheme.primary     // Blue-ish
            ListenState.Thinking -> MaterialTheme.colorScheme.tertiary     // Orange-ish
            ListenState.Speaking -> MaterialTheme.colorScheme.secondary    // Green-ish
            ListenState.Muted -> Color.Gray
            else -> MaterialTheme.colorScheme.outline
        }
    )

    /**
     * Create a subtle "pulsing" animation when listening.
     * The mic button scales up and down continuously while the system listens.
     */
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

    /**
     * Main layout background + column structure.
     * Gradient background with centered mic and related controls.
     */
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF141E30), Color(0xFF243B55))))
            .padding(16.dp)
    ) {
        val suggestionsVisible = true
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = if (suggestionsVisible) Arrangement.Center else Arrangement.Top
        ) {
            // Hidden developer feature: navigate when logo long-pressed
            SecretLogoTrigger(navController)

            Spacer(Modifier.height(8.dp))

            // Status message based on the current listen state
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

            /**
             * Core mic interaction area (button + animation)
             */
            Box(modifier = Modifier.fillMaxHeight(0.4f), contentAlignment = Alignment.Center) {
                MicVisuals(
                    listenState = listenState,
                    micColor = micColor,
                    pulseScale = pulseScale * 2f,  // exaggerated pulse scale for visibility
                    hasRecordPerm = true,          // permission handled within controller
                    onRequestPermission = { },
                    onStartListening = { micController.startListening() },
                    onStopListening = { micController.stopListening() },
                    onUpdateState = { newState ->
                        when (newState) {
                            ListenState.Muted -> micController.mute()
                            ListenState.Idle -> micController.unmute()
                            else -> {}
                        }
                    }
                )
            }

            Spacer(Modifier.height(12.dp))

            /**
             * Mute/Unmute toggle button.
             * - Turns red when muted.
             * - Resumes listening when unmuted.
             */
            Button(
                onClick = {
                    if (listenState == ListenState.Muted) micController.unmute()
                    else micController.mute()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (listenState == ListenState.Muted) Color.Red else Color(
                        0xFF141E30
                    )
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

            /**Conversation history (guest ↔ assistant dialogue) */
            if (conversation.isNotEmpty()) {
                ConversationList(conversation = conversation, listState = listState)
            }

            Spacer(Modifier.weight(1f))

            /**
             * Footer tips and rotating suggestions for the user.
             */
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
