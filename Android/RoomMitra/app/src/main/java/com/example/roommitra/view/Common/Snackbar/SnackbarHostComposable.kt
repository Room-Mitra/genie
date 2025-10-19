package com.example.roommitra.view

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.flow.StateFlow

@Composable
fun GlobalSnackbarHost(snackbarFlow: StateFlow<List<SnackbarMessage>>) {
    val messages by snackbarFlow.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .wrapContentHeight()
            .imePadding(), // push above keyboard
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        messages.forEach { snackbar ->
            AnimatedVisibility(
                visible = true,
                enter = fadeIn() + slideInVertically(initialOffsetY = { -50 }),
                exit = fadeOut() + slideOutVertically(targetOffsetY = { -50 })
            ) {
                SnackbarItem(
                    snackbar = snackbar,
                    onDismiss = { SnackbarManager.dismiss(snackbar.id) })
            }
        }
    }
}

@Composable
fun SnackbarItem(snackbar: SnackbarMessage, onDismiss: () -> Unit) {
    val backgroundColor = when (snackbar.type) {
        SnackbarType.SUCCESS -> Color(0xFF4CAF50)
        SnackbarType.ERROR -> Color(0xFFF44336)
        SnackbarType.INFO -> Color(0xFF2196F3)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth(0.5f)
            .background(backgroundColor, shape = MaterialTheme.shapes.medium)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = snackbar.message,
            color = Color.White,
            modifier = Modifier.weight(1f)
        )
        Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Dismiss",
            tint = Color.White,
            modifier = Modifier
                .size(20.dp)
                .clickable(
                    indication = null,
                    interactionSource = remember { MutableInteractionSource() }
                ) { onDismiss() }
        )
    }
}
