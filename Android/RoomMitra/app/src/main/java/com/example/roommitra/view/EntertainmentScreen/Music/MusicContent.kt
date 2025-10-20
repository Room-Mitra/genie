package com.example.roommitra.view

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.unit.dp

@Composable
fun MusicContent(controller: MusicPlayerController) {
    var query by remember { mutableStateOf("") }
    val videoId by controller.currentVideoId
    val musicState by controller.state

    val focusManager = LocalFocusManager.current

    Column(
        Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("Search YouTube") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row {
            if (musicState == MusicState.LOADING) {
                Button(
                    onClick = { },
                    modifier = Modifier.weight(1f)
                ) { Text("Loading ...") }
            } else {
                Button(
                    onClick = {
                        controller.playlist(listOf(query, "slim shady","lose yourself"))
                        query = ""
                        focusManager.clearFocus() // <-- hides the keyboard
                    },
                    modifier = Modifier.weight(1f)
                ) { Text("Play") }
            }
            Spacer(modifier = Modifier.width(16.dp))
        }
    }
}
