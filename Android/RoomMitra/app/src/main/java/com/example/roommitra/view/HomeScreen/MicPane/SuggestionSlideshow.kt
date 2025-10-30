package com.example.roommitra.view

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.SizeTransform
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun SuggestionSlideshow() {
    val suggestions = listOf(
        "Get me a cup of chai",
        "Ask housekeeping to clean my room",
        "Play bollywood music",
        "Tell me a joke",
        "Get me a bottle of drinking water",
        "How far is the airport?",
        "Send the bellboy to help me with my luggage",
        "I need extra pillows",
        "Play devotional songs",
        "Suggest vegan soups for lunch",
        "Who is Batman's nemesis?"
    )

    var currentIndex by remember { mutableStateOf(0) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(3000) // change every 3 seconds
            currentIndex = (currentIndex + 1) % suggestions.size
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp)
//            .background(
//                Color.White.copy(alpha = 0.08f),
//                RoundedCornerShape(20.dp)
//            )
//            .border(
//                1.dp,
//                Color.White.copy(alpha = 0.15f),
//                RoundedCornerShape(20.dp)
//            )
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        AnimatedContent(
            targetState = currentIndex,
            transitionSpec = {
                (fadeIn(animationSpec = tween(700)) + scaleIn(initialScale = 0.98f, animationSpec = tween(700))) togetherWith
                        (fadeOut(animationSpec = tween(700)) + scaleOut(targetScale = 1.02f, animationSpec = tween(700)))
            },
            label = "suggestions"
        ) { index ->
            Text(
                text = suggestions[index],
                color = Color.White,
                fontSize = 18.sp,
                textAlign = TextAlign.Center,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }
    }
}

