package com.example.roommitra.view

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
//import androidx.compose.material3.LocalIndication
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.*
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import com.airbnb.lottie.compose.*
import com.example.roommitra.R
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun NoActiveBookingScreen() {
    val scope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }

    // playful background gradient — premium but upbeat
    val bg = Brush.verticalGradient(listOf(Color(0xFF0F1724), Color(0xFF0F2434)))

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {
        // Decorative floating bubbles (fun, subtle)
        FloatingBubbles()

        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // HEADER
            Image(
                painter = painterResource(id = R.drawable.goldlogo),
                contentDescription = "Room Mitra Logo",
                modifier = Modifier
                    .size(100.dp)
                    .padding(top = 8.dp),
                contentScale = ContentScale.Fit
            )

            // HERO LOTTIE + headline (fun & big)
            HeroLottieCarouselWithText()

            Spacer(modifier = Modifier.height(16.dp))

            // FEATURES — horizontal, scaling items (swipeable feel)
            val features = listOf(
//                Feature("🎤", "Just say what you want. We handle the rest."),
//                Feature("\uD83C\uDFAE", "Play Fun Games & Relax !"),
//                Feature("🍽️", "Order Delicious Food in seconds."),
                Feature("🛎️", "Request Housekeeping or amenities."),
//                Feature("🎶", "Stream Your Music & Unwind!"),
//                Feature("💆‍♀️", "Book Spa & Experiences instantly"),
                Feature("\uD83D\uDDE3\uFE0F", "Voice Assistant - Just Ask, I’ll Handle It!"),
                Feature("\uD83D\uDCB0️", "Get exclusive offers on handpicked experiences"),
//                Feature("\uD83C\uDF89", "Discover the most happening places nearby!"),

                Feature("🍽️", "Instant food—no queue, no awkward small talk"),
//                Feature("🛎️", "Ask for fresh towels, anytime"),
                Feature("🎶", "Music & mood—set the vibe"),
                Feature("🎮", "Quick games for downtime"),
                Feature("💆‍♀️", "Book the spa — bliss in minutes"),
//                Feature("📍", "Discover nearby gems")
            )
            FeatureScroller(features = features)

            Spacer(modifier = Modifier.height(10.dp))

            // Cheeky line about price / delight
            Text(
                "Included with your stay — absolutely free. Consider it our little extra 😉",
                color = Color(0xFFBFCFD6),
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            // CTA footer
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                ConnectToReceptionButton(
                    isLoading = isLoading,
                    onClick = {
                        scope.launch {
                            isLoading = true
                            // trigger your API here
                            delay(900)
                            isLoading = false
                            message =
                                "Reception has been notified — one moment while we set up your butler!"
                        }
                    }
                )

                if (message != null) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        message!!,
                        color = Color(0xFFE8F1F4),
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    "Tap to enable your in-room AI concierge",
                    color = Color(0xFF9FB2BB),
                    fontSize = 13.sp
                )
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

/* ----------------------------
   Hero Lottie Carousel with text per animation
   - uses sample Lottie URLs (replace as you like)
   - headline/subtitle corresponds to current animation
   ---------------------------- */
@Composable
fun HeroLottieCarouselWithText() {
    // items: (lottieUrl, headline, subtitle)
    val items = listOf(
        Triple(
            "https://raw.githubusercontent.com/AdithyaPrabhu/roommitra/refs/heads/lottie/Headphone%20with%20blueberry%20cartoon.json",
            "Welcome to RoomMitra",
            "Your digital butler is ready — ask anything"
        ),
        Triple(
            "https://assets2.lottiefiles.com/packages/lf20_svy4ivvy.json",
            "Have some free time?",
            "Find out the most exciting events nearby!"
        ),
        Triple(
            "https://raw.githubusercontent.com/AdithyaPrabhu/roommitra/refs/heads/lottie/Dino%20Dance.json",
            "Chill Mode",
            "Play music, games or book a spa — instant delight"
        ),
        // Dancing sample from user's suggestion area (example)
        Triple(
            "https://raw.githubusercontent.com/AdithyaPrabhu/roommitra/refs/heads/main/Massage.json",
            "Discover everything this hotel has to offer!",
            "Spa, saloon and more.."
        )
    )

    var index by remember { mutableStateOf(0) }
    val animAlpha = remember { Animatable(1f) }
    val transition = rememberInfiniteTransition()
    val floatPulse by transition.animateFloat(
        initialValue = 0.98f, targetValue = 1.02f,
        animationSpec = infiniteRepeatable(tween(1000), RepeatMode.Reverse)
    )

    // auto-rotate
    LaunchedEffect(Unit) {
        while (true) {
            delay(6500)
            animAlpha.animateTo(0f, tween(700))
            index = (index + 1) % items.size
            animAlpha.animateTo(1f, tween(700))
        }
    }

    val (url, headline, subtitle) = items[index]
    val composition by rememberLottieComposition(LottieCompositionSpec.Url(url))
    val progress by animateLottieCompositionAsState(
        composition = composition,
        iterations = LottieConstants.IterateForever,
        isPlaying = true
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(360.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(Color(0x11000000))
            .alpha(animAlpha.value)
            .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(24.dp)),
        contentAlignment = Alignment.Center
    ) {
        // Lottie animation background (full)
        LottieAnimation(
            composition = composition,
            progress = { progress },
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    // slight breathing effect
                    scaleX = floatPulse
                    scaleY = floatPulse
                }
        )

        // gradient overlay to ensure text readability
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xBB021224))))
        )

        // headline + subtitle
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 24.dp)
        ) {
            Text(
                text = headline,
                color = Color(0xFFF8FAFB),
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = subtitle,
                color = Color(0xFFD8E6EA),
                fontSize = 14.sp,
                textAlign = TextAlign.Center
            )

            // small pager dots
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                items.indices.forEach { i ->
                    val dotColor = if (i == index) Color(0xFFFFD700) else Color(0xFF4A6B73)
                    Box(
                        modifier = Modifier
                            .padding(horizontal = 6.dp)
                            .size(if (i == index) 10.dp else 7.dp)
                            .clip(CircleShape)
                            .background(dotColor)
                    )
                }
            }
        }
    }
}

/* ----------------------------
   Feature Scroller — horizontal list with scaling of centered item
   - fun, clickable, tactile
   ---------------------------- */
@Composable
fun FeatureScroller(features: List<Feature>) {
    val listState = rememberLazyListState()
    var selectedIndex by remember { mutableStateOf(0) }
    val scope = rememberCoroutineScope()

    // auto-scroll highlight center item every few seconds (fun)
    LaunchedEffect(Unit) {
        while (true) {
            delay(3600)
            val next = (selectedIndex + 1) % features.size
            selectedIndex = next
            scope.launch {
                listState.animateScrollToItem(selectedIndex)
            }
        }
    }

    LazyRow(
        state = listState,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp)
            .padding(horizontal = 4.dp)
    ) {
        itemsIndexed(features) { idx, feat ->
            val isSelected = idx == selectedIndex
            val scale by animateFloatAsState(if (isSelected) 1.05f else 0.93f, tween(350))

            Box(
                modifier = Modifier
                    .width(160.dp)
                    .fillMaxHeight()
                    .graphicsLayer { scaleX = scale; scaleY = scale }
                    .clip(RoundedCornerShape(16.dp))
                    .background(if (isSelected) Color(0x20FFD700) else Color(0x11000000))
                    .border(
                        1.dp,
                        Color.White.copy(alpha = if (isSelected) 0.12f else 0.06f),
                        RoundedCornerShape(16.dp)
                    )
                    .pointerInput(Unit) {
                        detectTapGestures {
                            // on tap highlight this item immediately
                            selectedIndex = idx
                            // optional: do a preview action
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(feat.icon, fontSize = 36.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        feat.description,
                        color = Color(0xFFF2F7F8),
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                }
            }
        }
    }
}

/* ----------------------------
   Floating bubbles for playful background motion
   ---------------------------- */
@Composable
fun FloatingBubbles() {
    val bubbleCount = 6
    val rnd = remember { java.util.Random() }
    Box(modifier = Modifier.fillMaxSize()) {
        repeat(bubbleCount) { i ->
            val offsetX = remember { rnd.nextInt(1000).toFloat() }
            val offsetY = remember { rnd.nextInt(800).toFloat() }
            val size = remember { (20 + rnd.nextInt(60)).dp }
            val anim by rememberInfiniteTransition().animateFloat(
                initialValue = 0f,
                targetValue = 1f,
                animationSpec = infiniteRepeatable(
                    tween(
                        3000 + rnd.nextInt(4000),
                        easing = LinearEasing
                    ), RepeatMode.Reverse
                )
            )
            Box(
                modifier = Modifier
                    .offset(x = (offsetX % 300).dp, y = (offsetY % 500).dp)
                    .size(size)
                    .graphicsLayer { alpha = 0.08f + 0.2f * anim }
                    .clip(CircleShape)
                    .background(Color(0xFFB6E3E8))
            )
        }
    }
}

data class Feature(val icon: String, val description: String)

/* ----------------------------
   CTA Button (glowing gold) — clickable fixed correctly
   ---------------------------- */
@Composable
fun ConnectToReceptionButton(
    isLoading: Boolean,
    onClick: () -> Unit
) {
    val transition = rememberInfiniteTransition()
    val glow by transition.animateFloat(
        initialValue = 0.65f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(1000), RepeatMode.Reverse)
    )

    Box(
        modifier = Modifier
            .shadow(14.dp, RoundedCornerShape(40))
            .clip(RoundedCornerShape(40))
            .background(
                Brush.horizontalGradient(
                    listOf(
                        Color(0xFFFFE28A).copy(alpha = glow),
                        Color(0xFFFFC107).copy(alpha = glow)
                    )
                )
            )
            .clickable(
                enabled = !isLoading,
                onClick = onClick,
                indication = LocalIndication.current,
                interactionSource = remember { MutableInteractionSource() }
            )
            .padding(horizontal = 44.dp, vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                color = Color.Black,
                strokeWidth = 2.dp,
                modifier = Modifier.size(22.dp)
            )
        } else {
            Text(
                text = "Connect My Room",
                color = Color.Black,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
