// MusicPlayerController.kt
package com.example.roommitra.view

import android.content.Context
import android.util.Log
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.LifecycleOwner
import com.pierfrancescosoffritti.androidyoutubeplayer.core.customui.DefaultPlayerUiController
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.PlayerConstants
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView
import kotlinx.coroutines.*

enum class MusicState { IDLE, LOADING, PLAYING, STOPPED }

class MusicPlayerController(private val context: Context) : LifecycleEventObserver {

    var currentVideoId = mutableStateOf<String?>(null)
        private set
    var state = mutableStateOf(MusicState.IDLE)
        private set

    private var webView: WebView? = null
    private var extractionStarted = false
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private val youTubePlayerView: YouTubePlayerView = YouTubePlayerView(context).apply {
        enableAutomaticInitialization = false
        addYouTubePlayerListener(object : AbstractYouTubePlayerListener() {

            override fun onReady(player: YouTubePlayer) {
                youTubePlayer = player
                currentVideoId.value?.let { player.loadVideo(it, 0f) }

                // Default UI controller to hide clickable overlays
                val uiController = DefaultPlayerUiController(this@apply, player)
                this@apply.setCustomPlayerUi(uiController.rootView)
                uiController.showUi(false)
                uiController.showMenuButton(false)
                uiController.showFullscreenButton(false)
                uiController.showVideoTitle(false)
            }

            override fun onStateChange(player: YouTubePlayer, stateConst: PlayerConstants.PlayerState) {
                when (stateConst) {
                    PlayerConstants.PlayerState.PLAYING -> this@MusicPlayerController.state.value = MusicState.PLAYING
                    PlayerConstants.PlayerState.ENDED -> {
                        scope.launch {
                            playNextInPlaylist()
                        }
                    }
                    else -> { /* BUFFERING, UNSTARTED, etc — ignore */ }
                }
            }
        })
    }

    private var youTubePlayer: YouTubePlayer? = null

    private var playlistVideos: List<String> = emptyList()
    private var currentPlaylistIndex = 0
    private var isPlayingPlaylist = false

    fun attachToLifecycle(lifecycle: Lifecycle) {
        lifecycle.addObserver(this)
    }

    fun getPlayerView(): YouTubePlayerView = youTubePlayerView


    fun playlist(queries: List<String>) {
        if (queries.isEmpty()) return
        isPlayingPlaylist = true
        state.value = MusicState.LOADING
        currentPlaylistIndex = 0
        playlistVideos = queries
        playNextInPlaylist()
    }

    private fun playNextInPlaylist() {
        if (!isPlayingPlaylist || currentPlaylistIndex >= playlistVideos.size) {
            stop()
            return
        }
        val query = playlistVideos[currentPlaylistIndex]
        currentPlaylistIndex++
        state.value = MusicState.LOADING
        extractionStarted = false

        val searchUrl = "https://www.youtube.com/results?search_query=${query.replace(" ", "+")}+music"
        webView?.destroy()
        webView = WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    if (!extractionStarted) {
                        extractionStarted = true
                        scope.launch { extractVideoIdWithRetry(view, 5, 2000L) }
                    }
                }
            }
            loadUrl(searchUrl)
        }
    }

    private suspend fun extractVideoIdWithRetry(view: WebView?, retries: Int, delayMs: Long) {
        if (view == null || retries <= 0) {
            state.value = MusicState.STOPPED
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
            youTubePlayer?.loadVideo(cleanId, 0f)
        } else {
            delay(delayMs)
            extractVideoIdWithRetry(view, retries - 1, delayMs)
        }
    }

    fun stop() {
        isPlayingPlaylist = false
        youTubePlayer?.pause()
        state.value = MusicState.IDLE
        currentVideoId.value = null
        webView?.destroy()
        webView = null
    }

    override fun onStateChanged(source: LifecycleOwner, event: Lifecycle.Event) {
        if (event == Lifecycle.Event.ON_DESTROY) {
            youTubePlayerView.release()
        }
    }
}
