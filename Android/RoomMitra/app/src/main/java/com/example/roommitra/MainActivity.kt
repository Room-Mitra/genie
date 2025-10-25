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
import com.example.roommitra.service.TrackingService
import com.example.roommitra.view.ConciergeScreen

import com.example.roommitra.view.GlobalSnackbarHost
import com.example.roommitra.view.LoginScreen
import com.example.roommitra.view.MiniPlayer
import com.example.roommitra.view.MusicPlayerController
import com.example.roommitra.view.MusicPlayerManager
import com.example.roommitra.view.NoActiveBookingScreen
import com.example.roommitra.view.SnackbarManager


class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private lateinit var musicController: MusicPlayerController
    private val apiService by lazy { ApiService(this) }

    override fun onStart() {
        super.onStart()
    }

    override fun onStop() {
        super.onStop()
    }

    /** Reset auto-dim on any user interaction */
    override fun onUserInteraction() {
        super.onUserInteraction()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // initialize singleton
        MusicPlayerManager.init(applicationContext)
        musicController = MusicPlayerManager.get()

        TrackingService.initialize(this, apiService)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        hideSystemUI()
        setContent {
            val navController = rememberNavController()
            MaterialTheme {
                Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    AutoDimWrapper(window) {
                        NavHost(navController = navController, startDestination = "no-active-booking") {
//                            NavHost(navController = navController, startDestination = "home") {
                            composable("home") {
                                HomeScreen(navController = navController, musicController)
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
                                LoginScreen(onBackClick = { navController.popBackStack() })
                            }
                            composable("no-active-booking") {
                                NoActiveBookingScreen(navController = navController)
                            }
                        }
                        GlobalSnackbarHost(snackbarFlow = SnackbarManager.messages)


                        // MiniPlayer overlay — always rendered at root level so it survives navigation
                        // Place it last so it draws above NavHost
                        MiniPlayer(controller = musicController)
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

    override fun onInit(status: Int) {}

    override fun onDestroy() {
        super.onDestroy()
    }

}

