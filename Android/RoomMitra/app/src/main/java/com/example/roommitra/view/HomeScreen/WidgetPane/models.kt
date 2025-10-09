package com.example.roommitra.view.WidgetPane

import androidx.compose.ui.graphics.vector.ImageVector

data class WidgetCard(
    val title: String,
    val icon: ImageVector,
    val onClick: () -> Unit
)

data class Order(
    val title: String,
    val status: String,
    val eta: String,
    val icon: ImageVector
)

data class Deal(
    val title: String,
    val imageUrl: String
)
