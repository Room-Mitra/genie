package com.example.roommitra.view

import android.util.Log
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import androidx.navigation.NavHostController
import com.airbnb.lottie.compose.*
import com.example.roommitra.R
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject

@Composable
fun NoActiveBookingScreen(navController: NavHostController) {
    val scope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
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
            SecretLogoTrigger(navController)
            HeroLottieCarouselWithText()
            Spacer(modifier = Modifier.height(16.dp))
            Spacer(modifier = Modifier.height(10.dp))

            // Cheeky line about price / delight
            Text(
                "Included with your stay — absolutely free. Consider it our little extra 😉",
                color = Color(0xFFBFCFD6),
                fontSize = 20.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
            Spacer(modifier = Modifier.height(20.dp))

            // CTA footer
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                ConnectToReceptionButton(
                    isLoading = isLoading,
                    onClick = {
                        scope.launch {
                            isLoading = true
                            // trigger your API here
                            coroutineScope.launch {
                                val apiService = ApiService(context)

                                // Final request body
                                val requestBody = JSONObject().apply {
                                    put("department", "front_office")
                                    put("requestType", "Check In Guest")
                                    put("bookingId", null)
                                }

                                when (val result = apiService.post("requests", requestBody)) {
                                    is ApiResult.Success -> {
                                        message =
                                            "Reception has been notified — one moment while we set up your butler!"
                                    }
                                    is ApiResult.Error -> {
                                        message =
                                            "Something went wrong. Please try again later. Sorry :("
                                    }
                                }
                            }
                            isLoading = false

                        }
                    }
                )
                Spacer(modifier = Modifier.height(20.dp))

                if (message != null) {
                    Text(
                        message!!,
                        color = Color(0xFFE8F1F4),
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center
                    )
                } else {
                    Text(
                        "💡 Tap the button above to enable your in-room AI concierge",
                        color = Color(0xFF9FB2BB),
                        fontSize = 15.sp
                    )
                }


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
    // carousel items: (url, headline, subtitle)
    val items = listOf(
        Triple(
            "https://raw.githubusercontent.com/AdithyaPrabhu/roommitra/refs/heads/lottie/Customer%20service.json",
            "Welcome to RoomMitra",
            "Your personal butler — ask me anything anytime"
        ),
        Triple(
            "https://assets2.lottiefiles.com/packages/lf20_svy4ivvy.json",
            "Have some free time?",
            "Discover the most happening places nearby!"
        ),
        Triple(
            "https://raw.githubusercontent.com/AdithyaPrabhu/roommitra/refs/heads/lottie/Dancing.json",
            "Chill Mode",
            "Play music & games — instant delight"
        ),
        Triple(
            "https://raw.githubusercontent.com/AdithyaPrabhu/roommitra/refs/heads/main/Massage.json",
            "Discover everything this hotel has to offer!",
            "Spa, salon, and more..."
        )
    )

    val pagerState = rememberPagerState(pageCount = { items.size })
    val animAlpha = remember { Animatable(1f) }

    // breathing effect
    val transition = rememberInfiniteTransition()
    val floatPulse by transition.animateFloat(
        initialValue = 0.98f, targetValue = 1.02f,
        animationSpec = infiniteRepeatable(tween(1000), RepeatMode.Reverse)
    )

    // auto-scroll every few seconds
    LaunchedEffect(Unit) {
        while (true) {
            delay(6500)
            animAlpha.animateTo(0f, tween(500))
            val nextPage = (pagerState.currentPage + 1) % items.size
            pagerState.animateScrollToPage(nextPage)
            animAlpha.animateTo(1f, tween(500))
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(500.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(Color(0x11000000))
    ) {
        HorizontalPager(
            state = pagerState,
//            beyondBoundsPageCount = 1,
            modifier = Modifier
                .fillMaxSize()
                .alpha(animAlpha.value)
        ) { page ->
            val (url, headline, subtitle) = items[page]
            val composition by rememberLottieComposition(LottieCompositionSpec.Url(url))
            val progress by animateLottieCompositionAsState(
                composition = composition,
                iterations = LottieConstants.IterateForever,
                isPlaying = true
            )

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        scaleX = floatPulse
                        scaleY = floatPulse
                    },
                contentAlignment = Alignment.Center
            ) {
                // Lottie background
                LottieAnimation(
                    composition = composition,
                    progress = { progress },
                    modifier = Modifier.fillMaxSize()
                )

                // gradient overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color(0xCC021224))
                            )
                        )
                )

                // Text content
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 40.dp)
                ) {
                    Text(
                        text = headline,
                        color = Color(0xFFF8FAFB),
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = subtitle,
                        color = Color(0xFFD8E6EA),
                        fontSize = 18.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                }
            }
        }

        // pager dots (always visible)
        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 16.dp)
        ) {
            repeat(items.size) { index ->
                val isSelected = pagerState.currentPage == index
                Box(
                    modifier = Modifier
                        .padding(horizontal = 5.dp)
                        .size(if (isSelected) 12.dp else 8.dp)
                        .clip(CircleShape)
                        .background(if (isSelected) Color(0xFFFFD700) else Color(0xFF4A6B73))
                )
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
                text = "Alert Front Desk To Connect My Room",
                color = Color.Black,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
