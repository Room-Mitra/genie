package com.example.roommitra.view

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.window.Dialog

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HouseKeepingScreen(onBackClick: () -> Unit) {

    val quickRequests = listOf(
        "Get Fresh Towels" to Icons.Default.LocalLaundryService,
        "Clean my Room" to Icons.Default.CleaningServices,
        "Get Drinking Water" to Icons.Default.WaterDrop,
        "Get Dental Kit" to Icons.Default.EmojiEmotions,
        "Get Toiletries" to Icons.Default.Bathroom,
        "Refill Coffee/Tea Sachets" to Icons.Default.Coffee
    )

    val customRequestOption = listOf(
        "Custom Request" to Icons.Default.Edit
    )

    val checkoutOption = listOf(
        "Initiate Checkout" to Icons.Default.ExitToApp
    )

    var showDialog by remember { mutableStateOf(false) }
    var selectedRequest by remember { mutableStateOf<String?>(null) }
    var showCustomDialog by remember { mutableStateOf(false) }
    var customRequest by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Housekeeping") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.smallTopAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        modifier = Modifier.fillMaxSize()
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            SectionGrid(title = "Quick Requests", options = quickRequests, onClick = { option ->
                selectedRequest = option
                showDialog = true
            })

            SectionGrid(title = "Custom Request", options = customRequestOption, onClick = {
                showCustomDialog = true
            })

            SectionGrid(title = "Checkout", options = checkoutOption, onClick = { option ->
                selectedRequest = option
                showDialog = true
            })
        }
    }

    // --- Confirmation Dialog only for quick + checkout requests ---
    if (showDialog && selectedRequest != null) {
        ConfirmationDialog(
            request = selectedRequest!!,
            onDismiss = { showDialog = false },
            onConfirm = {
                // TODO: send request to backend
                showDialog = false
            }
        )
    }

    // --- Custom Request Dialog (no confirmation popup after send) ---
    if (showCustomDialog) {
        CustomRequestDialog(
            value = customRequest,
            onValueChange = { customRequest = it },
            onDismiss = { showCustomDialog = false },
            onSend = {
                if (customRequest.isNotBlank()) {
                    // Directly send custom request here
                    // TODO: send customRequest to backend
                    customRequest = ""
                    showCustomDialog = false
                }
            }
        )
    }
}

@Composable
fun SectionGrid(
    title: String,
    options: List<Pair<String, androidx.compose.ui.graphics.vector.ImageVector>>,
    onClick: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        LazyVerticalGrid(
            columns = GridCells.Fixed(6),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.heightIn(max = 200.dp)
        ) {
            items(options) { optionPair ->
                val (option, icon) = optionPair
                HousekeepingOptionCard(option, icon, onClick = { onClick(option) })
            }
        }
    }
}

@Composable
fun HousekeepingOptionCard(
    option: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.width(120.dp).height(150.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxSize().padding(12.dp)
        ) {
            Box(
                modifier = Modifier.size(48.dp).background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f), shape = CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = option, tint = MaterialTheme.colorScheme.primary)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = option,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 2
            )
        }
    }
}

// --- Custom Request Dialog ---
@Composable
fun CustomRequestDialog(
    value: String,
    onValueChange: (String) -> Unit,
    onDismiss: () -> Unit,
    onSend: () -> Unit
) {
    val keyboardController = LocalSoftwareKeyboardController.current
    LaunchedEffect(Unit) { keyboardController?.show() }

    Dialog(onDismissRequest = { onDismiss(); keyboardController?.hide() }) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text("Custom Request", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = value,
                    onValueChange = onValueChange,
                    label = { Text("Type your request") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions.Default.copy(imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            onSend()
                            keyboardController?.hide()
                        }
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
                Row(
                    horizontalArrangement = Arrangement.End,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    TextButton(onClick = { onDismiss(); keyboardController?.hide() }) { Text("Cancel") }
                    Spacer(modifier = Modifier.width(8.dp))
                    TextButton(onClick = { onSend(); keyboardController?.hide() }) { Text("Send") }
                }
            }
        }
    }
}

// --- Confirmation Dialog ---
@Composable
fun ConfirmationDialog(
    request: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text("Confirm Request", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text("Do you want to send the request: \"$request\"?")
                Row(
                    horizontalArrangement = Arrangement.End,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    TextButton(onClick = onDismiss) { Text("Cancel") }
                    Spacer(modifier = Modifier.width(8.dp))
                    TextButton(onClick = onConfirm) { Text("Confirm") }
                }
            }
        }
    }
}
