package com.example.roommitra.service

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import android.view.Window

class ScreenDimService : Service() {
    private val defaultbrightness = 90;
    private val binder = LocalBinder()
    private val handler = Handler(Looper.getMainLooper())
    private var window: Window? = null
    private var skipAutoDim = false
    private var dimTimeoutMs: Long = 30 * 1000 // default 0.5 minutes

    private val dimRunnable = Runnable {
        Log.d("ScreenDimService", "DimRunnable fired")
        window?.decorView?.post { setBrightnessPercent(5) }
    }

    inner class LocalBinder : Binder() {
        fun getService(): ScreenDimService = this@ScreenDimService
    }

    override fun onBind(intent: Intent?): IBinder = binder

    /** Attach window from Activity */
    fun attachWindow(window: Window) {
        this.window = window
        setBrightnessPercent(defaultbrightness)
    }

    /** Set brightness 0–100% */
    fun setBrightnessPercent(percent: Int) {
        val level = (percent.coerceIn(0, 100)) / 100f
        window?.let {
            val lp = it.attributes
            lp.screenBrightness = level
            it.attributes = lp
            Log.d("ScreenDimService", "Brightness set to $percent%")
        }
    }

    /** Reset the auto-dim timer (or start if not running) */
    fun resetAutoDimTimer(timeoutMs: Long = dimTimeoutMs) {
        Log.d("ScreenDimService", "resetAutoDimTimer() called, scheduling dim in $timeoutMs ms")
        handler.removeCallbacks(dimRunnable)
//        window?.decorView?.post { setBrightnessPercent(defaultbrightness) } // reset to full
        setBrightnessPercent(defaultbrightness)
        if (!skipAutoDim) {
            handler.postDelayed(dimRunnable, timeoutMs)
            Log.d("ScreenDimService", "Auto-dim timer scheduled for $timeoutMs ms")
        }
    }

    /** Enable or disable auto-dimming */
    fun setSkipAutoDim(skip: Boolean) {
        skipAutoDim = skip
        handler.removeCallbacks(dimRunnable)
        if (skip) setBrightnessPercent(defaultbrightness)
        else resetAutoDimTimer()
    }

    /** Update dim timeout (optional) */
    fun setDimTimeout(timeoutMs: Long) {
        dimTimeoutMs = timeoutMs
        resetAutoDimTimer()
    }
}
