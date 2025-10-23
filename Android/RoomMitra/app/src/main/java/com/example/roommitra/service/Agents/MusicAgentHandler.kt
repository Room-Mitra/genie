// MusicAgentHandler.kt
package com.example.roommitra.agent

import android.content.Context
import android.util.Log
import com.example.roommitra.view.MusicPlayerController
import com.example.roommitra.view.MusicPlayerManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

class MusicAgentHandler(private val context: Context) : AgentHandler {

    private val controller = MusicPlayerManager.get()
    private val mainScope = MainScope()

    override fun handle(parameters: List<String>, scope: CoroutineScope) {
        if (parameters.isEmpty()) {
            Log.w("MusicAgentHandler", "Empty playlist request")
            return
        }

        // Launch playback in a coroutine
        mainScope.launch {
            Log.d("MusicAgentHandler", "Playing playlist: $parameters")
            controller.playlist(parameters)
        }
    }

    fun getController(): MusicPlayerController = controller
}
