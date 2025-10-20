package com.example.roommitra.view

import android.content.Context
import android.util.Log
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.mutableStateOf
import kotlinx.coroutines.*

enum class MusicState { IDLE, LOADING, PLAYING, STOPPED }

class MusicPlayerController(
    private val context: Context
) {
    var currentVideoId = mutableStateOf<String?>(null)
        private set
    var state = mutableStateOf(MusicState.IDLE)
        private set

    private var webView: WebView? = null
    private var extractionStarted = false

    // Coroutine scope tied to the controller
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    fun play(query: String) {
        if (query.isBlank()) return
        state.value = MusicState.LOADING
        currentVideoId.value = null

        val searchQuery = query.replace(" ", "+") + "+music"
        val searchUrl = "https://www.youtube.com/results?search_query=$searchQuery"

        fun createWebView() {
            webView = WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                webChromeClient = WebChromeClient()
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        if (!extractionStarted) {
                            extractionStarted = true
                            Log.d("MusicPlayerController", "Running extraction...")
                            // Launch coroutine to extract videoId with retry
                            scope.launch {
                                extractVideoIdWithRetry(view, retries = 5, delayMs = 2000L)
                            }
                        } else {
                            Log.d("MusicPlayerController", "Skipping duplicate onPageFinished")
                        }
                    }
                }
                loadUrl(searchUrl)
            }
        }

        createWebView()
    }

    // Suspend function to retry extraction
    private suspend fun extractVideoIdWithRetry(view: WebView?, retries: Int, delayMs: Long) {
        Log.d("MusicPlayerController", "${retries} retries")

        if (view == null || retries <= 0) {
            state.value = MusicState.STOPPED
            Log.d("MusicPlayerController", "Giving up after retries")
            return
        }

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

        val result = CompletableDeferred<String?>()
        view.evaluateJavascript(jsCheck) { r -> result.complete(r) }
        val jsResult = result.await()

        if (jsResult != null && jsResult != "null") {
            val cleanId = jsResult.replace("\"", "")
            currentVideoId.value = cleanId
            state.value = MusicState.PLAYING
            Log.d("MusicPlayerController", "Found videoId: $cleanId")
        } else {
            Log.d("MusicPlayerController", "No videoId found, retrying in $delayMs ms, retries left: ${retries - 1}")
            delay(delayMs)
            extractVideoIdWithRetry(view, retries - 1, delayMs)
        }
    }

    fun stop() {
        Log.d("MusicPlayerController", "Stopping music")
        state.value = MusicState.IDLE
        currentVideoId.value = null
        extractionStarted = false
        webView?.destroy()
        webView = null
        // Cancel all pending coroutines
        scope.coroutineContext.cancelChildren()
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
