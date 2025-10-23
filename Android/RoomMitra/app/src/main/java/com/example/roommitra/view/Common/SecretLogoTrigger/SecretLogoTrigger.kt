package com.example.roommitra.view

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.example.roommitra.R

/**
 * A reusable composable that detects 5 quick taps on the logo and navigates to the login screen.
 */
@Composable
fun SecretLogoTrigger(navController: NavHostController) {
    val logoClickCount = remember { mutableStateOf(0) }
    val lastLogoClickTime = remember { mutableStateOf(0L) }
    val clickResetWindowMs = 1200L // if gap > this, reset count

    Image(
        painter = painterResource(R.drawable.goldlogo),
        contentDescription = "Room Mitra Logo",
        modifier = Modifier
            .height(64.dp)
            .padding(top = 12.dp)
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() }
            ) {
                val now = System.currentTimeMillis()

                if (now - lastLogoClickTime.value > clickResetWindowMs) {
                    // reset if too slow between taps
                    logoClickCount.value = 1
                } else {
                    logoClickCount.value += 1
                }

                lastLogoClickTime.value = now

                if (logoClickCount.value >= 5) {
                    logoClickCount.value = 0
                    navController.navigate("login")
                }
            },
        contentScale = ContentScale.Fit
    )
}
