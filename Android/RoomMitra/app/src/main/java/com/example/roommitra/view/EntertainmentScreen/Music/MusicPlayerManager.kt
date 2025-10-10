package com.example.roommitra.view

import android.content.Context

/**
 * Singleton holder for MusicPlayerController.
 * Initialize once with applicationContext before using.
 */
object MusicPlayerManager {
    private var controller: MusicPlayerController? = null

    fun init(context: Context) {
        if (controller == null) {
            controller = MusicPlayerController(context.applicationContext)
        }
    }

    fun get(): MusicPlayerController {
        return controller ?: throw IllegalStateException("MusicPlayerManager not initialized!")
    }
}
