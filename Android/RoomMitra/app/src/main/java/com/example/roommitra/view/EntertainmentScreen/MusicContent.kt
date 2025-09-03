package com.example.roommitra.view

import android.annotation.SuppressLint
import android.util.Log
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
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
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MusicContent() {
    var query by remember { mutableStateOf("") }
    var videoId by remember { mutableStateOf<String?>(null) }
    var searchUrl by remember { mutableStateOf<String?>(null) }

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

        Button(
            onClick = {
                if (query.isNotBlank()) {
                    val searchQuery = query.replace(" ", "+")
                    searchUrl = "https://www.youtube.com/results?search_query=$searchQuery"
                }
            }
        ) {
            Text("Play")
        }
    }

    // hidden WebView for scraping videoId
    if (searchUrl != null && videoId == null) {
        AndroidView(
            modifier = Modifier.size(1.dp), // keep it hidden
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    webChromeClient = WebChromeClient()
                    webViewClient = object : WebViewClient() {
                        override fun onPageFinished(view: WebView?, url: String?) {
                            super.onPageFinished(view, url)
                            Log.d("MusicContent", "Search page loaded: $url")

                            val jsCheck = """
                                (function() {
                                    var links = document.querySelectorAll("a[href*='/watch?v=']");
                                    if (links.length > 0) {
                                        var first = links[0].href;
                                        var match = first.match(/v=([^&]+)/);
                                        if (match && match[1]) {
                                            return match[1];
                                        }
                                    }
                                    return null;
                                })();
                            """.trimIndent()

                            view?.evaluateJavascript(jsCheck) { result ->
                                if (result != null && result != "null") {
                                    val cleanId = result.replace("\"", "")
                                    Log.d("MusicContent", "Extracted videoId: $cleanId")
                                    videoId = cleanId
                                    searchUrl = null   // ✅ remove the hidden WebView
                                } else {
                                    Log.d("MusicContent", "No videoId yet, retrying...")
                                    view?.postDelayed({ onPageFinished(view, url) }, 1000)
                                }
                            }
                        }
                    }
                    loadUrl(searchUrl!!)
                }
            }
        )
    }

    // show player when we have videoId
    if (videoId != null) {
        Dialog(
            onDismissRequest = { videoId = null },
            properties = DialogProperties(usePlatformDefaultWidth = false) // full screen
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
                                        Log.d("MusicContent", "Playing videoId: $id")
                                        youTubePlayer.loadVideo(id, 0f)
                                    }
                                }

                                override fun onStateChange(
                                    youTubePlayer: YouTubePlayer,
                                    state: com.pierfrancescosoffritti.androidyoutubeplayer.core.player.PlayerConstants.PlayerState
                                ) {
                                    if (state == com.pierfrancescosoffritti.androidyoutubeplayer.core.player.PlayerConstants.PlayerState.ENDED) {
                                        // ✅ Auto close popup when song ends
                                        videoId = null
                                    }
                                }
                            })
                        }
                    }
                )

                IconButton(
                    onClick = {
                        videoId = null
                        searchUrl = null
                    },
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
