package com.example.roommitra.view

import androidx.compose.material3.*
import androidx.compose.runtime.*
import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MusicContent() {
    var query by remember { mutableStateOf("") }
    var videoUrl by remember { mutableStateOf<String?>(null) }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
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
                    // YouTube search page
                    videoUrl = "https://www.youtube.com/results?search_query=$searchQuery"
                }
            }
        ) {
            Text("Play")
        }
    }

    // Full-screen video popup
    if (videoUrl != null) {
        Dialog(
            onDismissRequest = { videoUrl = null },
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
                        WebView(context).apply {
                            settings.javaScriptEnabled = true
                            webViewClient = WebViewClient()
                            loadUrl(videoUrl!!)
                        }
                    }
                )

                IconButton(
                    onClick = { videoUrl = null },
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
