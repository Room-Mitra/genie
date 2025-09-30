package com.example.roommitra

import AutoDimWrapper
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.ui.Modifier
import java.util.Locale
import android.view.View
import android.speech.tts.TextToSpeech
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import java.util.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.roommitra.service.ScreenDimService
import com.example.roommitra.view.AmenitiesScreen
import com.example.roommitra.view.EntertainmentScreen
import com.example.roommitra.view.HomeScreen
import com.example.roommitra.view.HouseKeepingScreen
import com.example.roommitra.view.RestaurantMenuScreen
import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import com.example.roommitra.service.ApiService
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import android.provider.Settings
import com.example.roommitra.service.ApiResult
import com.example.roommitra.view.ConciergeScreen
import com.example.roommitra.view.LoginScreen

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {

    private val apiService by lazy { ApiService(this) }
    private lateinit var tts: TextToSpeech
    private var sessionId: String = UUID.randomUUID().toString()
    private val autoListenTrigger = mutableStateOf(0L)

    companion object {
        val isTtsPlaying = mutableStateOf(false)
        private var ttsInstance: TextToSpeech? = null
        // 🔹 shared conversation state
        val conversation = mutableStateListOf<ConversationMessage>()
        fun stopTtsImmediately() {
            ttsInstance?.let {
                it.stop()                       // stop any ongoing speech
                isTtsPlaying.value = false      // update the state
            }
        }
    }

    private var screenDimService: ScreenDimService? = null
    private var bound = false

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as ScreenDimService.LocalBinder
            screenDimService = binder.getService()
            screenDimService?.attachWindow(window)
            screenDimService?.resetAutoDimTimer() // start timer
            bound = true
            Log.d("MainActivity", "ScreenDimService connected and window attached")
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            bound = false
            screenDimService = null
        }
    }

    override fun onStart() {
        super.onStart()
        bindService(Intent(this, ScreenDimService::class.java), connection, BIND_AUTO_CREATE)
    }

    override fun onStop() {
        super.onStop()
        if (bound) {
            unbindService(connection)
            bound = false
        }
    }

    /** Reset auto-dim on any user interaction */
    override fun onUserInteraction() {
        super.onUserInteraction()
        screenDimService?.resetAutoDimTimer()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        hideSystemUI()
        tts = TextToSpeech(this, this)
        setContent {
            val navController = rememberNavController()
            MaterialTheme {
                Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    AutoDimWrapper(screenDimService) {
                        NavHost(navController = navController, startDestination = "home") {
                            composable("home") {
                                HomeScreen(
                                    onFinalUtterance = { userQuery ->
                                        sendUtteranceToServer(
                                            userQuery
                                        )
                                    },
                                    navController = navController,
                                    autoListenTrigger = autoListenTrigger
                                )
                            }
                            composable("menu") {
                                RestaurantMenuScreen(onBackClick = { navController.popBackStack() })
                            }
                            composable("entertainment") {
                                EntertainmentScreen(onBackClick = { navController.popBackStack() })
                            }
                            composable("amenities") {
                                AmenitiesScreen(onBackClick = { navController.popBackStack() })
                            }
                            composable("housekeeping") {
                                HouseKeepingScreen(onBackClick = { navController.popBackStack() })
                            }
                            composable("concierge") {
                                ConciergeScreen(onBackClick = { navController.popBackStack() })
                            }
                            composable("login") {
                                LoginScreen(
                                    onBackClick = { navController.popBackStack() },
                                    apiService
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    private fun hideSystemUI() {
        window.decorView.systemUiVisibility =
            (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemUI()
    }

    override fun onBackPressed() {}

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            ttsInstance = tts
            tts.voices.forEach { voice -> if(voice.name.contains("en-in", ignoreCase = true))Log.d("TTS","${voice.name}") }
            val selectedVoice = tts.voices?.find {
                it.name.contains("en-in", ignoreCase = true) &&
                        it.name.contains("en-in-x-end-network", ignoreCase = true)
//                it.name.contains("en-in-x-ena-local", ignoreCase = true)
            }
            if (selectedVoice != null) tts.voice = selectedVoice
            else tts.language = Locale("en", "IN")

            tts.setOnUtteranceProgressListener(object :
                android.speech.tts.UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    this@MainActivity.runOnUiThread { isTtsPlaying.value = true }
                }

                override fun onDone(utteranceId: String?) {
                    this@MainActivity.runOnUiThread { isTtsPlaying.value = false }
                }

                override fun onError(utteranceId: String?) {
                    this@MainActivity.runOnUiThread { isTtsPlaying.value = false }
                }
            })
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        tts.stop()
        tts.shutdown()
    }

    private fun safeSpeak(text: String) {
        if (this::tts.isInitialized) {       // check if TTS is initialized
            try {
                if (!isFinishing) {          // ensure activity is not finishing
                    val utteranceId = UUID.randomUUID().toString()
                    tts.speak(text, TextToSpeech.QUEUE_ADD, null, utteranceId)
                }
            } catch (e: Exception) {
                Log.e("TTS", "Failed to speak: ${e.message}")
            }
        } else {
            Log.w("TTS", "TTS not initialized, cannot speak")
        }
    }

    private fun sendUtteranceToServer(userQuery: String) {
        lifecycleScope.launch {
            try {
                val payload = JSONObject().apply {
                    put("userQuery", userQuery)
                    put("sessionId", sessionId)
                }

                when (val result = apiService.post("utterance", payload)) {
                    is ApiResult.Success -> {
                        val jsonResp = result.data
                        Log.d("API_CALL", "Response: $jsonResp")

                        if (jsonResp != null) {
                            val speech = jsonResp.optString("speech", "")
                            val isSessionOpen = jsonResp.optBoolean("isSessionOpen", false)

                            if (speech.isNotEmpty()) {
                                MainActivity.conversation.add(ConversationMessage(speech, false))
                                safeSpeak(speech)
                            }

                            if (isSessionOpen) {
                                autoListenTrigger.value = System.currentTimeMillis()
                            } else {
                                sessionId = UUID.randomUUID().toString()
                            }
                        } else {
                            safeSpeak("No response from server.")
                        }
                    }
                    is ApiResult.Error -> {
                        Log.e("API_CALL", "Error ${result.code}: ${result.message}")
                        safeSpeak("Something went wrong. Please try later")

                    }
                }
            } catch (e: Exception) {
                Log.e("API_CALL", "Error sending utterance: ${e.message}")
                safeSpeak("Something went wrong. Please try later")
            }
        }
    }

}

