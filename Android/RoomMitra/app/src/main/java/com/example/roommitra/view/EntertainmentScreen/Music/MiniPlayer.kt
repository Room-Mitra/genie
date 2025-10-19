// MiniPlayer.kt
package com.example.roommitra.view

import android.view.View
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Popup
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView
import androidx.compose.ui.viewinterop.AndroidView
import kotlin.math.roundToInt

@Composable
fun MiniPlayer(
    controller: MusicPlayerController,
    modifier: Modifier = Modifier,
    initialOffset: Offset = Offset(100f, 500f), // initial px offset (adjust if you want)
    miniWidthDp: Int = 220*2,
    miniHeightDp: Int = 124*2
) {
    val videoId by controller.currentVideoId
    val musicState by controller.state

    // Only show if we are playing and have an id
    if (musicState != MusicState.PLAYING || videoId == null) return

    // Expansion state
    var isExpanded by remember { mutableStateOf(false) }

    // Draggable offset in px (store as Offset)
    var offset by remember { mutableStateOf(initialOffset) }

    val density = LocalDensity.current
    val miniWidthPx = with(density) { miniWidthDp.dp.toPx() }
    val miniHeightPx = with(density) { miniHeightDp.dp.toPx() }

    // Animated size (dp) for smooth expand/collapse
    val targetWidthDp = if (isExpanded) Int.MAX_VALUE else miniWidthDp
    val targetHeightDp = if (isExpanded) Int.MAX_VALUE else miniHeightDp

    // When expanded we show a full-screen overlay (Popup) so we can place player above everything.
    if (isExpanded) {
        // Fullscreen Popup overlay
        Popup(alignment = Alignment.Center) {
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .background(color = MaterialTheme.colorScheme.background),
                color = MaterialTheme.colorScheme.background
            ) {
                Box(Modifier.fillMaxSize()) {
                    // YouTube view (full screen)
                    AndroidView(
                        modifier = Modifier.fillMaxSize(),
                        factory = { ctx ->
                            YouTubePlayerView(ctx).apply {
                                enableAutomaticInitialization = false
                                // keep system UI handling to the activity; this is just the view
                                addYouTubePlayerListener(object : AbstractYouTubePlayerListener() {
                                    override fun onReady(youTubePlayer: YouTubePlayer) {
                                        videoId?.let { id -> youTubePlayer.loadVideo(id, 0f) }
                                    }
                                })
                                // required lifecycle handling is done by activity usually
                            }
                        }
                    )

                    // Close / shrink button
                    IconButton(
                        onClick = { isExpanded = false },
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(12.dp)
                            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.9f), RoundedCornerShape(50))
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Shrink")
                    }
                }
            }
        }
    } else {
        // Small draggable mini-player anchored using offset
        // We use a Box with pointerInput detectDragGestures and Modifier.offset
        Box(
            modifier = modifier
                .offset {
                    IntOffset(offset.x.roundToInt(), offset.y.roundToInt())
                }
                .width(miniWidthDp.dp)
                .height(miniHeightDp.dp)
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { /* optional */ },
                        onDragEnd = { /* optional: snap to edge if you want */ },
                        onDragCancel = { /* optional */ }
                    ) { change, dragAmount ->
                        change.consume()
                        offset = Offset(offset.x + dragAmount.x, offset.y + dragAmount.y)
                    }
                }
                .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.95f), RoundedCornerShape(12.dp))
        ) {
            AndroidView(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(4.dp)
                    .align(Alignment.Center),
                factory = { ctx ->
                    YouTubePlayerView(ctx).apply {
                        enableAutomaticInitialization = false
                        addYouTubePlayerListener(object : AbstractYouTubePlayerListener() {
                            override fun onReady(youTubePlayer: YouTubePlayer) {
                                videoId?.let { id -> youTubePlayer.loadVideo(id, 0f) }
                            }
                        })
                        // set player view properties as necessary
                    }
                }
            )

            // Top-right small close/shrink controls
            Row(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(6.dp)
            ) {
                // Expand on tap
                IconButton(
                    onClick = { isExpanded = true },
                    modifier = Modifier
                        .size(28.dp)
                        .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.06f), RoundedCornerShape(50))
                ) {
                    // you can put an expand icon here (use any icon you prefer)
                    Icon(Icons.Default.Fullscreen, contentDescription = "Expand", tint = MaterialTheme.colorScheme.onSurface)
                }

                Spacer(modifier = Modifier.width(4.dp))

                // Stop button
                IconButton(
                    onClick = { controller.stop() },
                    modifier = Modifier
                        .size(28.dp)
                        .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.06f), RoundedCornerShape(50))
                ) {
                    Icon(Icons.Default.Close, contentDescription = "Close")
                }
            }
        }
    }
}
