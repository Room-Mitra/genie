package com.example.roommitra.view

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

@Composable
fun LeftMenu(
    categories: List<String>,
    visibleCategory: String,
    categoryIndexMap: Map<String, Int>,
    coroutineScope: CoroutineScope,
    mainListState: LazyListState
) {
    Box(
        modifier = Modifier
            .width(220.dp)
            .fillMaxHeight()
            .background(MaterialTheme.colorScheme.surface)
            .padding(vertical = 16.dp)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxHeight(),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            items(items = categories, key = { it }) { category ->
                val isSelected = category == visibleCategory

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp)
                        .background(
                            brush = if (isSelected) {
                                Brush.horizontalGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.primary.copy(alpha = 0.9f),
                                        MaterialTheme.colorScheme.primary.copy(alpha = 0.7f)
                                    )
                                )
                            } else {
                                Brush.verticalGradient(
                                    colors = listOf(Color.Transparent, Color.Transparent)
                                )
                            },
                            shape = RoundedCornerShape(20.dp)
                        )
                        .clickable(
                            indication = null,
                            interactionSource = remember { MutableInteractionSource() }
                        ) {
                            categoryIndexMap[category]?.let { targetIndex ->
                                coroutineScope.launch {
                                    mainListState.scrollToItem(targetIndex)
                                }
                            }
                        }
                        .padding(vertical = 14.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = category,
                        fontSize = if (isSelected) 16.sp else 14.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else Color.Gray
                    )
                }
            }
        }
    }
}
