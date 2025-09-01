package com.example.roommitra

// (KEEPING ALL YOUR IMPORTS)
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.unit.dp

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import android.content.Intent
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import java.util.Locale
import android.view.View
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import kotlinx.coroutines.launch
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import java.util.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import com.example.roommitra.view.HomeScreen
import com.example.roommitra.view.RestaurantMenuScreen

// --- Simple UI state machine for the mic pane ---
enum class ListenState { Idle, Listening, Thinking, Speaking }

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private val dimHandler = Handler(Looper.getMainLooper())
    private val dimRunnable = Runnable { setAppBrightness(0.05f) }
    private lateinit var tts: TextToSpeech
    private var sessionId: String = UUID.randomUUID().toString()
    private val deviceId: String = "amzn1.ask.device.AMAXRJF4GUCRJ3HGY6X2J5HWP2FXP3SPYQOGKWDTXX4TQM5WXRHZVTJGBJPGKVJA7I3OHOIVM5JW6SM4A3STQH5DPGKPWC45PZN4A4G42BYGT4VZ5S5H2ZMD7U2G5H5QA5RXEAC2IEHMO3RHVDLAAZICNUSNREBIXMJYACCLJMM3SGSOOWKI2ZLNUH5M76KI6LRUWSOUQ2JJEI72"
    private val autoListenTrigger = mutableStateOf(0L)

    companion object {
        val isTtsPlaying = mutableStateOf(false)
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
                    NavHost(navController = navController, startDestination = "home") {
                        composable("home") {
                            HomeScreen(
                                onUserInteraction = { resetDimTimer() },
                                onFinalUtterance = { userQuery -> sendUtteranceToServer(userQuery) },
                                navController = navController,
                                autoListenTrigger = autoListenTrigger
                            )
                        }
                        composable("menu") {
                            RestaurantMenuScreen(onBackClick = {navController.popBackStack()})
                        }
                    }
                }
            }
        }
        resetDimTimer()
    }

    private fun setAppBrightness(level: Float) {
        val lp = window.attributes
        lp.screenBrightness = level
        window.attributes = lp
    }

    private fun resetDimTimer() {
        dimHandler.removeCallbacks(dimRunnable)
        setAppBrightness(1.0f)
        dimHandler.postDelayed(dimRunnable, 2 * 60 * 1000)
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
            val selectedVoice = tts.voices?.find {
                it.name.contains("en-in", ignoreCase = true) &&
                        it.name.contains("en-in-x-ena-local", ignoreCase = true)
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

    private fun sendUtteranceToServer(userQuery: String) {
        val client = OkHttpClient()
        val json = JSONObject().apply {
            put("userQuery", userQuery)
            put("sessionId", sessionId)
            put("deviceId", deviceId)
        }
        val body = RequestBody.create(
            "application/json; charset=utf-8".toMediaTypeOrNull(),
            json.toString()
        )
        Log.d("API_CALL", "Sending utterance: $userQuery")
        val request = Request.Builder()
            .url("http://192.168.1.3:3000/utterance")
//            .url("https://roommitra.com/utterance") do not uncomment -- currently while fetching all requests to show in UI we are not filtering based on hotel id.. if you uncomment this, Ananterra will get notified about the request
            .addHeader(
                "authorization",
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaG90ZWxJZCI6IlJvb20gR2VuaWUiLCJpYXQiOjE3NTYyNzEzMDEsImV4cCI6MTc1NzEzNTMwMX0.k1G6tUeL_Q_mDND5Vsa657HqGKXJEQEvbWb0o--dPMI"
            )
            .post(body)
            .build()
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                val utteranceId = UUID.randomUUID().toString()
                this@MainActivity.runOnUiThread {
                    tts.speak(
                        "Something went wrong. Please try later",
                        TextToSpeech.QUEUE_ADD, null, utteranceId
                    )
                }
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    val responseBody = response.body?.string()
                    if (responseBody != null) {
                        val jsonResp = JSONObject(responseBody)
                        val speech = jsonResp.optString("speech", "")
                        val isSessionOpen = jsonResp.optBoolean("isSessionOpen", false)
                        if (speech.isNotEmpty()) {
                            val utteranceId = UUID.randomUUID().toString()
                            this@MainActivity.runOnUiThread {
                                tts.speak(speech, TextToSpeech.QUEUE_ADD, null, utteranceId)
                            }
                        }
                        if (isSessionOpen) {
                            // Ask UI to auto-listen again (after TTS finishes)
                            this@MainActivity.runOnUiThread {
                                autoListenTrigger.value = System.currentTimeMillis()
                            }
                        } else {
                            // Close the session and rotate sessionId
                            sessionId = UUID.randomUUID().toString()
                        }
                    }
                }
            }
        })
    }
}

