package com.example.roommitra.view

import android.content.Context
import android.util.Log
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.mutableStateOf

enum class MusicState { IDLE, LOADING, PLAYING, STOPPED }

class MusicPlayerController(
    private val context: Context
) {
    var currentVideoId = mutableStateOf<String?>(null)
        private set
    var state = mutableStateOf(MusicState.IDLE)
        private set

    private var webView: WebView? = null

    fun play(query: String) {
        if (query.isBlank()) return
        state.value = MusicState.LOADING

        val searchQuery = query.replace(" ", "+") + "+music"
        val searchUrl = "https://www.youtube.com/results?search_query=$searchQuery"

        webView = WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    Log.d("MusicPlayerController", "Search page loaded: $url")

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
                            Log.d("MusicPlayerController", "Extracted videoId: $cleanId")
                            currentVideoId.value = cleanId
                            state.value = MusicState.PLAYING
                           // onVideoReady(cleanId)
                        } else {
                            Log.d("MusicPlayerController", "No videoId yet, retrying...")
                            view?.postDelayed({ onPageFinished(view, url) }, 1000)
                        }
                    }
                }
            }
            loadUrl(searchUrl)
        }
    }

    fun stop() {
        Log.d("MusicPlayerController", "Stopping music")
        state.value = MusicState.STOPPED
        currentVideoId.value = null
        webView?.destroy()
        webView = null
    }
}



//fun handleVoiceCommand(command: String) {
//    val controller = MusicPlayerManager.get()
//    when {
//        command.contains("play", ignoreCase = true) -> {
//            val query = extractQueryFromCommand(command) // your logic
//            controller.play(query)
//        }
//        command.equals("stop", ignoreCase = true) -> {
//            controller.stop()
//        }
//    }
//}

