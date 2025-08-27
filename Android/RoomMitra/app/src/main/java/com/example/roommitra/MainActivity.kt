package com.example.roommitra

// (KEEPING ALL YOUR IMPORTS)
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
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
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

// --- Simple UI state machine for the mic pane ---
enum class ListenState { Idle, Listening, Thinking, Speaking }

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private val dimHandler = Handler(Looper.getMainLooper())
    private val dimRunnable = Runnable { setAppBrightness(0.05f) }
    private lateinit var tts: TextToSpeech
    private var sessionId: String = UUID.randomUUID().toString()
    private val deviceId: String = "RoomMitraDevice-001"

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
                            RoomMitraHome(
                                onUserInteraction = { resetDimTimer() },
                                onFinalUtterance = { userQuery -> sendUtteranceToServer(userQuery) },
                                navController = navController
                            )
                        }
                        composable("menu") {
                            RestaurantMenuScreen(navController = navController)
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
        val request = Request.Builder()
            .url("http://192.168.1.4:3000/utterance")
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
                        if (!isSessionOpen) sessionId = UUID.randomUUID().toString()
                    }
                }
            }
        })
    }
}

// ------------------------- UI ----------------------------

@Composable
fun RoomMitraHome(
    onUserInteraction: () -> Unit,
    onFinalUtterance: (String) -> Unit,
    navController: NavHostController
) {
    val isLandscape =
        LocalConfiguration.current.orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE
    if (isLandscape) {
        Row(Modifier.fillMaxSize()) {
            MicPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                onUserInteraction = onUserInteraction,
                onFinalUtterance = onFinalUtterance
            )
            WidgetsPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                onUserInteraction = onUserInteraction,
                navController = navController
            )
        }
    } else {
        Column(Modifier.fillMaxSize()) {
            MicPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                onUserInteraction = onUserInteraction,
                onFinalUtterance = onFinalUtterance
            )
            WidgetsPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                onUserInteraction = onUserInteraction,
                navController = navController
            )
        }
    }
}

@Composable
fun WidgetsPane(
    modifier: Modifier = Modifier,
    onUserInteraction: () -> Unit,
    navController: NavHostController
) {
    val cards = remember {
        listOf(
            WidgetCard(
                "Restaurant Menu",
                "Explore today’s specials"
            ) { navController.navigate("menu") },
            WidgetCard("Housekeeping", "Towels, cleaning, water") { },
            WidgetCard("Concierge", "Cabs, attractions, tips") { },
            WidgetCard("Request Status", "Track your requests") { },
            WidgetCard("Entertainment", "YouTube / OTT (curated)") { },
            WidgetCard("Amenities", "Pool timings, spa, walks") { },
        )
    }
    Column(modifier = modifier.padding(24.dp)) {
        Text(
            "Quick Actions",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(Modifier.height(12.dp))
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(cards) { card ->
                Card(
                    onClick = card.onClick,
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1.6f)
                ) {
                    Column(
                        Modifier
                            .padding(16.dp)
                            .fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            card.title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            card.subtitle,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

data class WidgetCard(val title: String, val subtitle: String, val onClick: () -> Unit)

// ---------------- Restaurant Menu Screen --------------------
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RestaurantMenuScreen(navController: NavHostController) {
    var cart by remember { mutableStateOf(mutableMapOf<String, Int>()) }
    var showCart by remember { mutableStateOf(false) }
    val menu = restaurantMenuData()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Restaurant Menu") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        bottomBar = {
            if (cart.isNotEmpty()) {
                BottomAppBar {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Cart: ${cart.values.sum()} items")
                        Button(onClick = { showCart = true }) {
                            Text("Cart")
                        }
                    }
                }
            }
        }
    ) { padding ->
        Column(
            Modifier
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(12.dp)
        ) {
            menu.forEach { (category, dishes) ->
                Text(
                    category,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(6.dp))
                dishes.forEach { (dish, price) ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            Modifier
                                .padding(12.dp)
                                .fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(dish)
                                Text("₹$price", style = MaterialTheme.typography.bodySmall)
                            }
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                IconButton(
                                    onClick = {
                                        val newCart = cart.toMutableMap()
                                        val current = newCart[dish] ?: 0
                                        if (current > 0) newCart[dish] = current - 1
                                        if (newCart[dish] == 0) newCart.remove(dish)
                                        cart = newCart
                                    },
                                    enabled = (cart[dish] ?: 0) > 0
                                ) {
                                    Icon(Icons.Default.Remove, contentDescription = "Remove")
                                }
                                Text("${cart[dish] ?: 0}")
                                IconButton(
                                    onClick = {
                                        val newCart = cart.toMutableMap()
                                        newCart[dish] = (newCart[dish] ?: 0) + 1
                                        cart = newCart
                                    }
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Add")
                                }
                            }
                        }
                    }
                }
                Spacer(Modifier.height(12.dp))
            }
        }
    }

    // 🛒 Cart Dialog
    if (showCart) {
        AlertDialog(
            onDismissRequest = { showCart = false },
            confirmButton = {
                Button(onClick = {
                    // handle order confirmation
                    cart = mutableMapOf()
                    showCart = false
                }) {
                    Text("Confirm Order")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCart = false }) {
                    Text("Close")
                }
            },
            title = { Text("Your Cart") },
            text = {
                if (cart.isEmpty()) {
                    Text("Your cart is empty.")
                } else {
                    Column {
                        cart.forEach { (dish, count) ->
                            Row(
                                Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("$dish x$count")
                                // You could also show price here if you want
                            }
                        }
                        Spacer(Modifier.height(12.dp))
                        Text("Total: ₹${calculateTotal(menu, cart)}", fontWeight = FontWeight.Bold)
                    }
                }
            }
        )
    }
}

// 🔑 Helper to calculate total
fun calculateTotal(menu: Map<String, List<Pair<String, Int>>>, cart: Map<String, Int>): Int {
    var total = 0
    cart.forEach { (dish, count) ->
        val price = menu.values.flatten().firstOrNull { it.first == dish }?.second ?: 0
        total += price * count
    }
    return total
}

@Composable
fun MicPane(
    modifier: Modifier = Modifier,
    onUserInteraction: () -> Unit,
    onFinalUtterance: (String) -> Unit
) {
    var listenState by remember { mutableStateOf(ListenState.Idle) }
    var recognizedText by remember { mutableStateOf("") }
    val ctx = LocalContext.current


    // Observe the TTS playing flag set by MainActivity's UtteranceProgressListener
    val ttsPlaying by MainActivity.isTtsPlaying

// If TTS starts, switch UI state to Speaking; when TTS stops, revert to Idle only if we set it.
    LaunchedEffect(ttsPlaying) {
        if (ttsPlaying) {
            listenState = ListenState.Speaking
        } else {
            // only reset to Idle if it was the Speaking state
            if (listenState == ListenState.Speaking) {
                listenState = ListenState.Idle
            }
        }
    }


    // --- SpeechRecognizer setup ---
    val speechRecognizer = remember {
        if (SpeechRecognizer.isRecognitionAvailable(ctx)) {
            SpeechRecognizer.createSpeechRecognizer(ctx)
        } else null
    }
    // Attach listener
    DisposableEffect(Unit) {
        if (speechRecognizer != null) {
            speechRecognizer.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    onUserInteraction()
                }

                override fun onBeginningOfSpeech() {
                    onUserInteraction()
                }

                override fun onEndOfSpeech() {
                    listenState = ListenState.Thinking
                }

                override fun onError(error: Int) {
                    listenState = ListenState.Idle
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        recognizedText = matches[0]
                        onUserInteraction()
                        onFinalUtterance(recognizedText) // 🔴 send to API
                    }
//                    listenState = ListenState.Idle
                }

                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onRmsChanged(rmsdB: Float) {}
            })
        }
        onDispose { speechRecognizer?.destroy() }
    }

    // Permission handling
    val hasRecordPerm = remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.RECORD_AUDIO) ==
                    PackageManager.PERMISSION_GRANTED
        )
    }
    val requestPermissionLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            hasRecordPerm.value = granted
            if (granted) {
                listenState = ListenState.Listening
                startListening(ctx, speechRecognizer)
                onUserInteraction()
            }
        }

    // Animated mic color per state
    val targetColor = when (listenState) {
        ListenState.Idle -> MaterialTheme.colorScheme.primary
        ListenState.Listening -> Color(0xFF00C853)
        ListenState.Thinking -> Color(0xFFFFA000)
        ListenState.Speaking -> Color(0xFF00C853)
    }
    val micColor by animateColorAsState(targetValue = targetColor, label = "micColor")

    val pulse = rememberInfiniteTransition(label = "pulse")
    val pulseScale by pulse.animateFloat(
        initialValue = 1.0f,
        targetValue = if (listenState == ListenState.Listening) 1.08f else 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Column(
        modifier = modifier
            .padding(24.dp)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onUserInteraction() },
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Header
        Column {
            Text(
                "Room Mitra",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = when (listenState) {
                    ListenState.Idle -> "Tap the mic or say your wake word"
                    ListenState.Listening -> "Listening… speak now"
                    ListenState.Thinking -> "Thinking…"
                    ListenState.Speaking -> "Speaking…"
                },
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (recognizedText.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Text("You said: $recognizedText", style = MaterialTheme.typography.bodyLarge)
            }
        }

        // Create a small eq-style pulse while TTS is playing:
        val eqPulse = rememberInfiniteTransition()
        val barScale by eqPulse.animateFloat(
            initialValue = 0.4f, targetValue = 1f,
            animationSpec = infiniteRepeatable(tween(450), RepeatMode.Reverse)
        )

        // Big Mic Button
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentAlignment = Alignment.Center
        ) {
            val icon = when (listenState) {
                ListenState.Idle, ListenState.Listening -> Icons.Default.Mic
                ListenState.Thinking -> Icons.Default.GraphicEq
                else -> Icons.Default.Mic
            }
            Box(
                modifier = Modifier
                    .size(220.dp)
                    .scale(pulseScale)
                    .background(micColor.copy(alpha = 0.12f), CircleShape)
                    .border(3.dp, micColor, CircleShape)
                    .clickable(
                        indication = null,
                        interactionSource = remember { MutableInteractionSource() }
                    ) {
                        onUserInteraction()
                        if (!hasRecordPerm.value) {
                            requestPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                            return@clickable
                        }
                        when (listenState) {
                            ListenState.Idle -> {
                                listenState = ListenState.Listening
                                startListening(ctx, speechRecognizer)
                            }

                            ListenState.Listening -> {
                                listenState = ListenState.Thinking
                                speechRecognizer?.stopListening()
                            }

                            ListenState.Thinking -> {
                                listenState = ListenState.Speaking
                            }

                            ListenState.Speaking -> {
                                listenState = ListenState.Idle
                            }
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
//                Icon(imageVector = icon, contentDescription = "Mic", tint = micColor, modifier = Modifier.size(96.dp))
            }
            when (listenState) {
                ListenState.Idle, ListenState.Listening -> {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Mic",
                        tint = micColor,
                        modifier = Modifier.size(96.dp)
                    )
                }

                ListenState.Thinking -> {
                    // Add rotation animation while thinking
                    val rotation by rememberInfiniteTransition(label = "thinkingRotation")
                        .animateFloat(
                            initialValue = 0f,
                            targetValue = 360f,
                            animationSpec = infiniteRepeatable(
                                tween(durationMillis = 1200, easing = LinearEasing),
                                RepeatMode.Restart
                            ),
                            label = "rotateAnim"
                        )

                    Icon(
                        imageVector = Icons.Default.GraphicEq,
                        contentDescription = "Thinking",
                        tint = micColor,
                        modifier = Modifier
                            .size(96.dp)
                            .rotate(rotation) // 🔥 rotation effect
                    )
                }

                ListenState.Speaking -> {
                    // Animated bars instead of mic
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        repeat(3) {
                            Box(
                                Modifier
                                    .size(20.dp, (50 * barScale).dp)
                                    .background(micColor, RoundedCornerShape(4.dp))
                            )
                        }
                    }
                }
            }
        }

        // Bottom controls
        Row(
            Modifier
                .fillMaxWidth()
                .defaultMinSize(minHeight = 64.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            val small = MaterialTheme.typography.bodyMedium
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = if (hasRecordPerm.value) Icons.Default.Mic else Icons.Default.MicOff,
                    contentDescription = null,
                    tint = if (hasRecordPerm.value) MaterialTheme.colorScheme.primary else Color.Red
                )
                Spacer(Modifier.size(8.dp))
                Text(
                    if (hasRecordPerm.value) "Mic permission granted" else "Mic permission needed",
                    style = small
                )
            }
            Text(
                "Tip: “Hey Mitra…”",
                style = small,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

private fun startListening(ctx: android.content.Context, speechRecognizer: SpeechRecognizer?) {
    val recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
    }
    speechRecognizer?.startListening(recognizerIntent)
}

// ---------------- Hardcoded Menu ------------------

fun restaurantMenuData(): Map<String, List<Pair<String, Int>>> {
    return mapOf(
        "Soups" to listOf(
            "Pumpkin Soup" to 160,
            "Lemon Coriander Soup" to 180,
            "Cream of Broccoli" to 190,
            "Sweet Corn (Veg)" to 180,
            "Sweet Corn (Chicken)" to 270,
            "Hot and Sour (Veg)" to 180,
            "Hot and Sour (Chicken)" to 270,
            "Manchow Soup (Veg)" to 180,
            "Manchow Soup (Chicken)" to 270
        ),
        "Salads" to listOf(
            "Green Salad" to 160,
            "Pineapple Mint Salad" to 180,
            "Greek Salad" to 190,
            "Hawaiian Chicken Salad" to 230
        ),
        "Starters" to listOf(
            "French Fries" to 160,
            "Nuggets (Veg)" to 220,
            "Veg Samosa" to 220,
            "Veg/Onion Pakora" to 140,
            "Cauliflower Ularathu" to 260,
            "Honey Chilly Potato" to 260,
            "Baby Corn Manchurian" to 310,
            "Paneer Hot Garlic" to 310,
            "Nuggets (Chicken)" to 260,
            "Chicken 65" to 380,
            "Chicken Malli Peralan" to 380,
            "Chicken Kondattam" to 380,
            "Chicken Lollipop" to 380,
            "Prawns Tawa Fry" to 450,
            "Mutton Pepper Fry" to 560,
            "Mutton Coconut Fry" to 560
        ),
        "Short Bites" to listOf(
            "Club Sandwich" to 220,
            "Veg Sandwich" to 160,
            "Chicken Sandwich" to 200,
            "Egg Sandwich" to 180,
            "Pakoras (Onion)" to 120,
            "Pakoras (Veg)" to 130,
            "Pakoras (Egg)" to 140,
            "Momos (Veg)" to 235,
            "Momos (Chicken)" to 260,
            "Kathi Roll (Paneer)" to 180,
            "Kathi Roll (Egg)" to 200,
            "Kathi Roll (Chicken)" to 220
        ),
        "Poultry" to listOf(
            "Chicken Mulagittathu" to 295,
            "Chicken Mappas" to 260,
            "Chicken Ghee Roast" to 280,
            "Nadan Chicken Curry" to 260,
            "Chicken Varutharachathu" to 260,
            "Chicken Rara Masala" to 280,
            "Kadai Chicken" to 295,
            "Butter Chicken Masala" to 295
        ),
        "Veggies" to listOf(
            "Kadai Veg" to 295,
            "Aloo Shimla" to 260,
            "Nilgiri Veg Korma" to 280,
            "Aloo Jeera" to 260,
            "Aloo Mutter Masala" to 260,
            "Veg Hyderabadi" to 280,
            "Paneer Butter Masala" to 295,
            "Palak Paneer" to 295,
            "Paneer Lazeez" to 295,
            "Bindi Masala" to 260,
            "Mushroom Masala" to 280,
            "Dal Tadka" to 225,
            "Panjabi Dal Tadka" to 250
        ),
        "Chinese" to listOf(
            "Hot Garlic Chicken" to 415,
            "Chilly Chicken" to 415,
            "Chicken Manchurian" to 415,
            "Dragon Chicken" to 415,
            "Schezwan Chicken" to 430,
            "Ginger Chicken" to 450,
            "Garlic Prawns" to 420,
            "Chilly Prawns" to 450,
            "Chilly Mushroom" to 380,
            "Cauliflower Manchurian" to 400,
            "Chilly Fish" to 400
        ),
        "Fish" to listOf(
            "Fish Tawa Fry (2 slices)" to 480,
            "Fish Mulagittathu" to 430,
            "Malabar Fish Curry" to 440,
            "Kerala Fish Curry" to 440,
            "Fish Moilee" to 450,
            "Fish Masala" to 450,
            "Prawns Roast" to 450,
            "Prawns Masala" to 450,
            "Prawns Ularthu" to 450
        ),
        "Local Cuisine" to listOf(
            "Pidi with Chicken Curry" to 550,
            "Bamboo Puttu Chicken" to 450,
            "Bamboo Puttu (Fish/Prawns)" to 500,
            "Bamboo Puttu (Paneer/Mushroom)" to 400,
            "Bamboo Puttu Mix Veg" to 375,
            "Paal Kappa with Veg Mappas" to 400,
            "Paal Kappa with Fish Curry" to 500,
            "Bamboo Biriyani Veg" to 400,
            "Bamboo Biriyani Chicken" to 500,
            "Bamboo Biriyani Fish/Prawns" to 500
        ),
        "Mutton" to listOf(
            "Mutton Rogan Josh" to 560,
            "Kollam Mutton Curry" to 540,
            "Mutton Korma" to 530,
            "Mutton Pepper Fry" to 560,
            "Mutton Masala" to 530
        ),
        "Bread" to listOf(
            "Kerala Paratha" to 35,
            "Nool Paratha" to 35,
            "Wheat Paratha" to 40,
            "Chappathi" to 25,
            "Phulka" to 20,
            "Appam" to 25
        ),
        "Rice and Noodles" to listOf(
            "Plain Rice" to 160,
            "Veg Pulao" to 250,
            "Peas Pulao" to 230,
            "Jeera Rice" to 200,
            "Tomato Rice" to 200,
            "Lemon Rice" to 200,
            "Veg Biriyani" to 320,
            "Curd Rice" to 220,
            "Ghee Rice" to 260,
            "Egg Biriyani" to 360,
            "Chicken Biriyani" to 400,
            "Mutton Biriyani" to 580,
            "Prawns Biriyani" to 500,
            "Fish Biriyani" to 450,
            "Veg Fried Rice" to 280,
            "Egg Fried Rice" to 280,
            "Chicken Fried Rice" to 300,
            "Schezwan Fried Rice" to 350,
            "Prawns Fried Rice" to 350,
            "Veg Noodles" to 310,
            "Egg Noodles" to 330,
            "Chicken Noodles" to 380,
            "Schezwan Noodles" to 400
        ),
        "Grilled" to listOf(
            "Grilled Chicken (Pepper/Chilli/Hariyali) Half" to 700,
            "Grilled Chicken (Pepper/Chilli/Hariyali) Full" to 1200,
            "Chicken Tikka (Malai/Red Chilli/Hariyali)" to 550,
            "Grilled Veg (Paneer/Mushroom)" to 400,
            "Fish Tikka (Basa)" to 450
        ),
        "Pasta" to listOf(
            "Alfredo Veg" to 330,
            "Alfredo Chicken" to 380,
            "Arrabbiata Veg" to 330,
            "Arrabbiata Chicken" to 380,
            "Rosso Veg" to 330,
            "Rosso Chicken" to 380
        ),
        "Desserts" to listOf(
            "Butter Banana Gulkand" to 260,
            "Palada with Ice Cream" to 250,
            "Gulab Jamun (2 nos)" to 250,
            "Gajar Ka Halwa" to 235,
            "Fruit Salad with Ice Cream" to 250,
            "Ice Cream (Single Scoop)" to 150
        ),
        "Drinks" to listOf(
            "Fresh Lime Soda/Water" to 80,
            "Virgin Mojito" to 140,
            "Virgin Mary" to 150,
            "Virgin Pina Colada" to 150,
            "Buttermilk" to 150
        ),
        "Milkshakes" to listOf(
            "Strawberry Milkshake" to 180,
            "Chocolate Milkshake" to 180,
            "Vanilla Milkshake" to 180,
            "Oreo Milkshake" to 180,
            "Banana Milkshake" to 180
        ),
        "Tea" to listOf(
            "Kerala Chai" to 50,
            "Ginger Masala Chai" to 80,
            "Iced Tea" to 80,
            "Lemon Tea" to 50
        ),
        "Coffee" to listOf(
            "Coffee" to 50,
            "Filter Coffee" to 80,
            "Iced Americano" to 140,
            "Cold Coffee" to 130
        )
    )
}
