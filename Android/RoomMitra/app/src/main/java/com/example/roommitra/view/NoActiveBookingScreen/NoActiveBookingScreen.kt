package com.example.roommitra.view

import android.util.Log
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import androidx.navigation.NavHostController
import com.airbnb.lottie.compose.*
import com.example.roommitra.data.DepartmentType
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject

@Composable
fun NoActiveBookingScreen(navController: NavHostController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }
    var isSuccess by remember { mutableStateOf(false) }
    var isError by remember { mutableStateOf(false) }

    val bg = Brush.verticalGradient(listOf(Color(0xFF0F1724), Color(0xFF0F2434)))

    // 🕒 Automatically reset success state after 1 hour
    LaunchedEffect(isSuccess,isError,isLoading) {
        if (isSuccess || isError || isLoading) {
            delay( 60 * 60 * 1000L) // 1 hour in milliseconds
            isSuccess = false
            isLoading = false
            isError = false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {
        FloatingBubbles()
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            SecretLogoTrigger(navController)
            Spacer(modifier = Modifier.height(30.dp))

            HeroLottieCarouselWithText()
            Spacer(modifier = Modifier.height(50.dp))

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                ConnectToReceptionButton(
                    isLoading = isLoading,
                    isSuccess = isSuccess,
                    isError = isError,
                    onClick = {
                        scope.launch {
                            isLoading = true
                            isError = false
                            val apiService = ApiService(context)
                            val requestBody = JSONObject().apply {
                                put("department", DepartmentType.FRONT_OFFICE.key)
                                put("requestType", "Check In Guest")
                                put("bookingId", null)
                            }

                            when (val result = apiService.post("requests", requestBody)) {
                                is ApiResult.Success -> {
                                    isSuccess = true
                                }

                                is ApiResult.Error -> {
                                    isError = true
                                }
                            }
                            isLoading = false
                        }
                    }
                )

                Spacer(modifier = Modifier.height(24.dp))

                when {
                    isSuccess -> {
                        AnimatedVisibility(visible = true, enter = fadeIn(), exit = fadeOut()) {
                            Text(
                                text = "✅ We’re setting up your personal butler!",
                                color = Color(0xFFBFCFD6),
                                fontSize = 15.sp,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 24.dp)
                            )
                        }
                    }

                    isError -> {
                        AnimatedVisibility(visible = true, enter = fadeIn(), exit = fadeOut()) {
                            Text(
                                text = "⚠️ Couldn’t reach the front desk. Please try again after some time.",
                                color = Color(0xFFBFCFD6),
                                fontSize = 15.sp,
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    else -> {
                        Text(
                            "Enjoy complimentary access to your personal room assistant, included with your stay.",
                            color = Color(0xFFBFCFD6),
                            fontSize = 16.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }
            }
        }
    }
}

/* ----------------------------
   CTA Button (handles success/loading/error)
   ---------------------------- */
@Composable
fun ConnectToReceptionButton(
    isLoading: Boolean,
    isSuccess: Boolean,
    isError: Boolean,
    onClick: () -> Unit
) {
    val transition = rememberInfiniteTransition(label = "glowTransition")
    val glow by transition.animateFloat(
        initialValue = 0.65f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(1000), RepeatMode.Reverse),
        label = "glowAnim"
    )

    // 🌈 Button gradient colors based on state
    val gradientColors = when {
        isLoading -> listOf(Color(0xFFB0BEC5), Color(0xFF90A4AE)) // muted silver
        isSuccess -> listOf(Color(0xFFA8E6CF), Color(0xFF56C596)) // green gradient
        isError -> listOf(Color(0xFFFF8A80), Color(0xFFFF5252))   // red/pink gradient
        else -> listOf(
            Color(0xFFFFE28A).copy(alpha = glow),
            Color(0xFFFFC107).copy(alpha = glow)
        )
    }

    val buttonText = when {
        isLoading -> "Connecting..."
        isSuccess -> "Reception Notified"
        isError -> "Try Again"
        else -> "Your In-Room Assistant Awaits — Let Front Desk Know"
    }

    val textColor = when {
        isLoading -> Color.Black
        isSuccess -> Color(0xFF003300) // deep green
        isError -> Color(0xFF330000)   // deep red
        else -> Color.Black
    }

    val disabled = isSuccess || isLoading

    Box(
        modifier = Modifier
            .shadow(14.dp, RoundedCornerShape(40))
            .clip(RoundedCornerShape(40))
            .background(Brush.horizontalGradient(gradientColors))
            .clickable(
                enabled = !disabled,
                onClick = onClick,
                indication = LocalIndication.current,
                interactionSource = remember { MutableInteractionSource() }
            )
            .padding(horizontal = 44.dp, vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        when {
            isLoading -> CircularProgressIndicator(
                color = Color.Black,
                strokeWidth = 2.dp,
                modifier = Modifier.size(22.dp)
            )

            else -> Text(
                text = buttonText,
                color = textColor,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
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
    val items = listOf(
        Triple(
            "https://raw.githubusercontent.com/AdithyaPrabhu/roommitra/refs/heads/lottie/Customer%20service.json",
            "Welcome to Room Mitra",
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
            "https://raw.githubusercontent.com/AdithyaPrabhu/roommitra/refs/heads/lottie/Makeup%2C%20beauty.json",
            "Discover everything this hotel has to offer!",
            "Spa, salon, and more..."
        ),
        Triple(
            "https://raw.githubusercontent.com/AdithyaPrabhu/roommitra/refs/heads/lottie/Unicum.json",
            "Vacation Mode - ON!!",
            "Relax, Refresh & Rejuvenate with RoomMitra"
        )
    )

    val pagerState = rememberPagerState(pageCount = { items.size })

    // Auto-scroll loop (simple + reliable)
    LaunchedEffect(Unit) {
        while (true) {
            delay(6500)
            if (!pagerState.isScrollInProgress) {
                val next = (pagerState.currentPage + 1) % items.size
                pagerState.animateScrollToPage(next)
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(480.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(Color(0x11000000))
    ) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize()
        ) { page ->
            val (url, title, subtitle) = items[page]

            // Lottie composition
            val composition by rememberLottieComposition(LottieCompositionSpec.Url(url))
            val progress by animateLottieCompositionAsState(
                composition = composition,
                iterations = LottieConstants.IterateForever
            )

            Box(modifier = Modifier.fillMaxSize()) {
                // Background animation
                LottieAnimation(
                    composition = composition,
                    progress = { progress },
                    modifier = Modifier.fillMaxSize()
                )

                // Gradient overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(Color.Transparent, Color(0xCC021224))
                            )
                        )
                )

                // Text content
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 40.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = title,
                        color = Color(0xFFF8FAFB),
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = subtitle,
                        color = Color(0xFFD8E6EA),
                        fontSize = 17.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 24.dp)
                    )
                }
            }
        }

        // Page indicators
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            repeat(items.size) { index ->
                val isSelected = pagerState.currentPage == index
                Box(
                    modifier = Modifier
                        .padding(horizontal = 4.dp)
                        .size(if (isSelected) 12.dp else 8.dp)
                        .clip(CircleShape)
                        .background(
                            if (isSelected) Color(0xFFFFD700)
                            else Color(0xFF4A6B73)
                        )
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
