package com.example.roommitra.view

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
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

    // --- Section data ---
    val roomCleaning = listOf(
        "Change Towels" to Icons.Default.LocalLaundryService,
        "Room Cleaning" to Icons.Default.CleaningServices,
        "Clean Toilet" to Icons.Default.Bathroom,
        "Room Freshener" to Icons.Default.Spa,
    )

    val bedding = listOf(
        "Change Linen" to Icons.Default.Bed,
        "Extra Blanket" to Icons.Default.Checkroom,
        "Softer Pillows" to Icons.Default.Hotel,
        "Harder Pillows" to Icons.Default.Hotel,
    )

    val miscellanious = listOf(
        "Laundry Pickup" to Icons.Default.LocalLaundryService,
        "Shoe Cleaning" to Icons.Default.Checkroom,
        "Iron & Ironing Board" to Icons.Default.Iron,
        "Extra Toiletries" to Icons.Default.Spa,
        "Umbrella Request" to Icons.Default.Umbrella
    )

    val foodRefreshments = listOf(
        "Mini-Bar Refill" to Icons.Default.LocalBar,
        "Tea/Coffee Refill" to Icons.Default.Coffee,
        "Water Bottle" to Icons.Default.WaterDrop,
        "Fruit Basket" to Icons.Default.ShoppingBasket
    )

    val maintenanceRequests = listOf(
        "Fix Light" to Icons.Default.Build,
        "Fix Appliance" to Icons.Default.Build,
        "Plumbing Issue" to Icons.Default.Plumbing,
    )

    val specialRequests = listOf(
        "Do Not Disturb" to Icons.Default.DoNotDisturbOn,
        "Wake-up Call" to Icons.Default.Alarm
    )

    val checkoutOption = listOf(
        "Request Late Checkout" to Icons.Default.ExitToApp,
        "Initiate Checkout" to Icons.Default.ExitToApp,
    )

    // --- State ---
    var showDialog by remember { mutableStateOf(false) }
    var selectedRequest by remember { mutableStateOf<String?>(null) }
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

        // Scrollable 2-column layout
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(32.dp),
                modifier = Modifier.weight(1f)
            ) {
                PremiumSectionCard("🧹 Room Cleaning") {
                    SectionGrid(roomCleaning) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
                PremiumSectionCard("🛠️ Maintenance") {
                    SectionGrid(maintenanceRequests) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
                PremiumSectionCard("🛏️ Bedding") {
                    SectionGrid(bedding) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }

                PremiumSectionCard("🏁 Checkout") {
                    SectionGrid(checkoutOption) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
            }


            Column(
                verticalArrangement = Arrangement.spacedBy(32.dp),
                modifier = Modifier.weight(1f)
            ) {
                PremiumSectionCard("🍴 Food & Refreshments") {
                    SectionGrid(foodRefreshments) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
                PremiumSectionCard("🔑 Special") {
                    SectionGrid(specialRequests) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
                PremiumSectionCard("Miscellaneous") {
                    SectionGrid(miscellanious) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }

            }
        }
    }

    // --- Confirmation Dialog ---
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
}

@Composable
fun PremiumSectionCard(
    title: String,
    content: @Composable () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(1.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(12.dp))
            content()
        }
    }
}

@Composable
fun SectionGrid(
    options: List<Pair<String, androidx.compose.ui.graphics.vector.ImageVector>>,
    onClick: (String) -> Unit
) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 120.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(max = 400.dp)
    ) {
        items(options) { optionPair ->
            val (option, icon) = optionPair
            HousekeepingOptionCard(option, icon, onClick = { onClick(option) })
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
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.85f)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f), shape = CircleShape),
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
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
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
