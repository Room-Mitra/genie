package com.example.roommitra.view

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.roommitra.view.MusicPlayerController
import com.example.roommitra.view.MusicState
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView
@Composable
fun MusicContent(controller: MusicPlayerController) {
   var query by remember { mutableStateOf("") }

    val videoId by controller.currentVideoId
    val musicState by controller.state

    // Observe the controller's videoId updates
 //   LaunchedEffect(controller.currentVideoId) {
   //     videoId = controller.currentVideoId
    //}

    Column(
        Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("Search YouTube") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row {
            if(musicState == MusicState.LOADING) {
                Button(
                    onClick = {  },
                    modifier = Modifier.weight(1f)
                ) { Text("Loading ...") }
            }else{
            Button(
                onClick = { controller.play(query) },
                modifier = Modifier.weight(1f)
            ) { Text("Play") }
                }
            Spacer(modifier = Modifier.width(16.dp))

//            Button(
//                onClick = { controller.stop() },
//                modifier = Modifier.weight(1f)
//            ) { Text("Stop") }
        }
    }

    // show player when we have videoId
    if (videoId != null && musicState == MusicState.PLAYING) {
        Dialog(
            onDismissRequest = { controller.stop() },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black)
            ) {
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { context ->
                        YouTubePlayerView(context).apply {
                            enableAutomaticInitialization = false
                            addYouTubePlayerListener(object : AbstractYouTubePlayerListener() {
                                override fun onReady(youTubePlayer: YouTubePlayer) {
                                    videoId?.let { id ->
                                        youTubePlayer.loadVideo(id, 0f)
                                    }
                                }
                            })
                        }
                    }
                )

                IconButton(
                    onClick = { controller.stop() },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(12.dp)
                        .background(Color.White.copy(alpha = 0.6f), RoundedCornerShape(50))
                ) {
                    Icon(Icons.Default.Close, contentDescription = "Close")
                }
            }
        }
    }
}
