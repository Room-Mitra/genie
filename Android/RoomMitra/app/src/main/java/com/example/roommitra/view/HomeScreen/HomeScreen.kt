package com.example.roommitra.view

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.navigation.NavHostController

@Composable
fun HomeScreen(
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
                onFinalUtterance = onFinalUtterance,
                autoListenTrigger = autoListenTrigger,
                navController = navController
            )
            WidgetsPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                navController = navController
            )
        }
    } else {
        Column(Modifier.fillMaxSize()) {
            MicPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                onFinalUtterance = onFinalUtterance,
                autoListenTrigger = autoListenTrigger,
                navController = navController
            )
            WidgetsPane(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                navController = navController
            )
        }
    }
}
