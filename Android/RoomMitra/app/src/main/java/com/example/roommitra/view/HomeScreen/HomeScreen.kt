package com.example.roommitra.view

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavHostController
import com.example.roommitra.ListenState

@Composable
fun HomeScreen(
    onUserInteraction: () -> Unit,
    onFinalUtterance: (String) -> Unit,
    navController: NavHostController,
    autoListenTrigger: androidx.compose.runtime.State<Long>
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
                onFinalUtterance = onFinalUtterance,
                autoListenTrigger = autoListenTrigger
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
                onFinalUtterance = onFinalUtterance,
                autoListenTrigger = autoListenTrigger
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
