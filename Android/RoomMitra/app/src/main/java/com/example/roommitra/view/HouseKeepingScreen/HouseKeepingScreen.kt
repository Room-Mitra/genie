package com.example.roommitra.view

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.exclude
import androidx.compose.foundation.layout.windowInsetsPadding

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HouseKeepingScreen(onBackClick: () -> Unit) {
    val options = listOf(
        "Get Fresh Towels",
        "Clean my Room",
        "Initiate Checkout",
        "Get Drinking Water",
        "Get Dental Kit",
        "Get Toiletries",
        "Refill Coffee/Tea Sachets",
        "Custom Request"
    )

    var showDialog by remember { mutableStateOf(false) }
    var selectedRequest by remember { mutableStateOf<String?>(null) }
    var customRequest by remember { mutableStateOf("") }
    var showCustomDialog by remember { mutableStateOf(false) }

    // 👇 Key to reset Scaffold layout after any dialog closes
    var resetKey by remember { mutableStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Housekeeping") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        },
        modifier = Modifier
            .windowInsetsPadding(
                WindowInsets.safeDrawing.exclude(WindowInsets.ime)
            )
            .let { if (resetKey > 0) Modifier else Modifier } // 👈 force recomposition
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Quick Requests",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            LazyVerticalGrid(
                columns = GridCells.Fixed(6),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(options) { option ->
                    Card(
                        onClick = {
                            if (option == "Custom Request") {
                                showCustomDialog = true
                            } else {
                                selectedRequest = option
                                showDialog = true
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(1f)
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.fillMaxSize()
                        ) {
                            Text(option, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }

    // Confirmation Dialog
    if (showDialog && selectedRequest != null) {
        AlertDialog(
            onDismissRequest = {
                showDialog = false
                resetKey++ // 👈 reset after closing confirmation popup
            },
            title = { Text("Confirm Request") },
            text = { Text("Do you want to send the request: \"$selectedRequest\"?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        // TODO: send housekeeping request to backend
                        showDialog = false
                        resetKey++
                    }
                ) {
                    Text("Confirm")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showDialog = false
                        resetKey++
                    }
                ) {
                    Text("Cancel")
                }
            }
        )
    }

    // Custom Request Dialog
    if (showCustomDialog) {
        val keyboardController = LocalSoftwareKeyboardController.current

        LaunchedEffect(Unit) {
            keyboardController?.show()
        }

        AlertDialog(
            onDismissRequest = {
                showCustomDialog = false
                keyboardController?.hide()
                resetKey++ // 👈 reset after closing custom popup
            },
            title = { Text("Custom Request") },
            text = {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(
                            indication = null,
                            interactionSource = remember { MutableInteractionSource() }
                        ) { keyboardController?.hide() }
                        .padding(top = 8.dp)
                ) {
                    OutlinedTextField(
                        value = customRequest,
                        onValueChange = { customRequest = it },
                        label = { Text("Type your request") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions.Default.copy(
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(
                            onDone = {
                                if (customRequest.isNotBlank()) {
                                    selectedRequest = customRequest
                                    customRequest = ""
                                    showCustomDialog = false
                                    showDialog = true
                                    resetKey++
                                }
                                keyboardController?.hide()
                            }
                        )
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (customRequest.isNotBlank()) {
                            selectedRequest = customRequest
                            customRequest = ""
                            showCustomDialog = false
                            showDialog = true
                            keyboardController?.hide()
                            resetKey++
                        }
                    }
                ) {
                    Text("Send")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showCustomDialog = false
                        keyboardController?.hide()
                        resetKey++
                    }
                ) {
                    Text("Cancel")
                }
            }
        )
    }
}
