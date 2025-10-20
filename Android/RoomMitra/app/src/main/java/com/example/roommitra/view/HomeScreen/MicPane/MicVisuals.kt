package com.example.roommitra.view

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
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun MicButton(micColor: Color, pulseScale: Float, onMicClick: () -> Unit) {
    Box(contentAlignment = Alignment.Center) {
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

@Composable
fun ThinkingDots(micColor: Color) {
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
fun SpeakingBars(micColor: Color) {
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


/**
 * MicControl
 * ----------
 * Handles what appears inside the mic area depending on [listenState].
 * This may include:
 * - The interactive mic button
 * - Thinking animation (dots)
 * - Speaking animation (bars)
 * - Disabled mic (Muted)
 */
@Composable
fun MicVisuals(
    listenState: ListenState,
    hasRecordPerm: Boolean,
    onRequestPermission: () -> Unit,
    onStartListening: () -> Unit,
    onStopListening: () -> Unit,
    onUpdateState: (ListenState) -> Unit
) {
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
    Box(contentAlignment = Alignment.Center) {
        when (listenState) {
            ListenState.Idle, ListenState.Listening -> {
                // The main mic button – tap to start/stop listening
                MicButton(micColor, pulseScale*2) {
                    if (!hasRecordPerm) {
                        onRequestPermission()
                        return@MicButton
                    }
                    when (listenState) {
                        ListenState.Idle -> {
                            onUpdateState(ListenState.Listening)
                            onStartListening()
                        }
                        ListenState.Listening -> {
                            onStopListening()
                            onUpdateState(ListenState.Idle)
                        }
                        else -> {}
                    }
                }
            }
            ListenState.Thinking -> ThinkingDots(micColor)
            ListenState.Speaking -> SpeakingBars(micColor)
            ListenState.Muted -> MicButton(micColor, 1f) { } // Inactive mic
        }
    }
}
