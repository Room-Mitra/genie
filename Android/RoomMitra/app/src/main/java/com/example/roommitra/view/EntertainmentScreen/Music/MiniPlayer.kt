// MiniPlayer.kt
package com.example.roommitra.view

import android.view.View
import android.view.ViewGroup
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.FullscreenExit
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Popup
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView
import kotlinx.coroutines.launch
import kotlin.math.roundToInt


@Composable
fun MiniPlayer(
    controller: MusicPlayerController,
    lifecycleOwner: LifecycleOwner = LocalLifecycleOwner.current
) {
    val videoId by controller.currentVideoId
    val musicState by controller.state

    if (musicState != MusicState.PLAYING || videoId == null) return

    val density = LocalDensity.current
    val scope = rememberCoroutineScope()
    val screenWidthPx = with(density) { LocalConfiguration.current.screenWidthDp.dp.toPx() }
    val screenHeightPx = with(density) { LocalConfiguration.current.screenHeightDp.dp.toPx() }

    var isExpanded by remember { mutableStateOf(false) }
    val offsetX = remember { Animatable(100f) }
    val offsetY = remember { Animatable(500f) }

    val miniWidth = 440.dp
    val miniHeight = 248.dp

    DisposableEffect(lifecycleOwner) {
        controller.attachToLifecycle(lifecycleOwner.lifecycle)
        onDispose {}
    }

    // Remember the playerView once — no recreation between expanded/minimized
    val playerView = remember { controller.getPlayerView() }

    if (isExpanded) {
        Popup(alignment = Alignment.Center, onDismissRequest = { isExpanded = false }) {
            Box(
                Modifier
                    .fillMaxSize()
                    .background(Color.Black)
            ) {
                // Use existing view instance safely
                AndroidView(
                    factory = {
                        // Always remove from any previous parent before reusing
                        (playerView.parent as? ViewGroup)?.removeView(playerView)
                        playerView
                    },
                    modifier = Modifier.fillMaxSize()
                )
                Row(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(12.dp)
                ) {
                    IconButton(
                        onClick = { isExpanded = false },
                        modifier = Modifier
//                            .padding(12.dp)
                            .size(32.dp)
                            .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(50))
                    ) {
                        Icon(
                            Icons.Default.FullscreenExit,
                            contentDescription = null,
                            tint = Color.White
                        )
                    }

                    IconButton(
                        onClick = { controller.stop() },
                        modifier = Modifier
                            .size(32.dp)
                            .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(50))
                    ) {
                        Icon(Icons.Default.Close, contentDescription = null, tint = Color.White)
                    }
                }
            }
        }
    } else {
        Box(
            Modifier
                .offset { IntOffset(offsetX.value.roundToInt(), offsetY.value.roundToInt()) }
                .width(miniWidth)
                .height(miniHeight)
                .clip(RoundedCornerShape(12.dp))
                .background(Color.Black)
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragEnd = {
                            val targetX = if (offsetX.value < screenWidthPx / 2) 0f
                            else screenWidthPx - with(density) { miniWidth.toPx() }
                            val targetY = offsetY.value.coerceIn(
                                0f,
                                screenHeightPx - with(density) { miniHeight.toPx() })
                            scope.launch {
                                offsetX.animateTo(targetX, tween(400))
                                offsetY.animateTo(targetY, tween(400))
                            }
                        }
                    ) { change, drag ->
                        change.consume()
                        scope.launch {
                            offsetX.snapTo(offsetX.value + drag.x)
                            offsetY.snapTo(offsetY.value + drag.y)
                        }
                    }
                }
        ) {
            AndroidView(
                factory = {
                    (playerView.parent as? ViewGroup)?.removeView(playerView)
                    playerView
                },
                modifier = Modifier.fillMaxSize()
            )

            Row(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(6.dp)
            ) {
                IconButton(
                    onClick = { isExpanded = true },
                    modifier = Modifier
                        .size(32.dp)
                        .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(50))
                ) {
                    Icon(Icons.Default.Fullscreen, contentDescription = null, tint = Color.White)
                }

                IconButton(
                    onClick = { controller.stop() },
                    modifier = Modifier
                        .size(32.dp)
                        .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(50))
                ) {
                    Icon(Icons.Default.Close, contentDescription = null, tint = Color.White)
                }
            }
        }
    }
}


