package com.example.roommitra.view

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.roommitra.ConversationMessage

@Composable
fun ConversationList(
    conversation: List<ConversationMessage>,
    listState: androidx.compose.foundation.lazy.LazyListState
) {
    LazyColumn(
        state = listState,
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(12.dp)
            .background(
                Color.White.copy(alpha = 0.05f),
                RoundedCornerShape(20.dp)
            )
            .border(
                1.dp,
                Color.White.copy(alpha = 0.12f),
                RoundedCornerShape(20.dp)
            )
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(conversation) { message ->

            val alignment = if (message.isUser) Alignment.CenterEnd else Alignment.CenterStart

            // Bubble gradients
            val bubbleColors = if (message.isUser) {
                Brush.horizontalGradient(
                    listOf(Color(0xFF141E30), Color(0xFF243B55))
                )
            } else {
                Brush.horizontalGradient(
                    listOf(Color(0xFF243B55), Color(0xFF141E30))
                )
            }

            // Animate appearance
            AnimatedVisibility(
                visible = true,
                enter = androidx.compose.animation.fadeIn(
                    animationSpec = tween(400)
                ) + androidx.compose.animation.expandHorizontally(),
                exit = androidx.compose.animation.fadeOut()
            ) {
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = alignment
                ) {
                    Text(
                        text = message.text,
                        color = if (message.isUser) Color.Gray else MaterialTheme.colorScheme.surface,
//                        color = if (message.isUser) Color.Gray else Color(0xFFFAFAFA),
                        modifier = Modifier
                            .shadow(8.dp, RoundedCornerShape(18.dp))
                            .background(bubbleColors, RoundedCornerShape(18.dp))
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                            .widthIn(max = 280.dp),
                        fontSize = 16.sp,
                        lineHeight = 20.sp,
                        textAlign = if (message.isUser) TextAlign.End else TextAlign.Start
                    )
                }
            }
        }
    }

    // Auto-scroll to the latest message
    LaunchedEffect(conversation.size) {
        if (conversation.isNotEmpty()) {
            listState.animateScrollToItem(conversation.size - 1)
        }
    }
}

