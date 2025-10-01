package com.example.roommitra.view

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import com.example.roommitra.view.components.ConfirmationDialog
import com.example.roommitra.view.data.HousekeepingSections
import kotlinx.coroutines.launch
import org.json.JSONObject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HouseKeepingScreen(onBackClick: () -> Unit) {

    var showDialog by remember { mutableStateOf(false) }
    var selectedRequest by remember { mutableStateOf<String?>(null) }

    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // --- Top Bar ---
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            IconButton(onClick = onBackClick) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text("Housekeeping", style = MaterialTheme.typography.titleLarge)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // --- Two Column Layout ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(32.dp),
                modifier = Modifier.weight(1f)
            ) {
                PremiumSectionCard("🧹 Room Cleaning") {
                    SectionGrid(HousekeepingSections.roomCleaning) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
                PremiumSectionCard("🛠️ Maintenance") {
                    SectionGrid(HousekeepingSections.maintenanceRequests) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
                PremiumSectionCard("🛏️ Bedding") {
                    SectionGrid(HousekeepingSections.bedding) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
                PremiumSectionCard("🏁 Checkout") {
                    SectionGrid(HousekeepingSections.checkoutOption) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
            }

            Column(
                verticalArrangement = Arrangement.spacedBy(32.dp),
                modifier = Modifier.weight(1f)
            ) {
                PremiumSectionCard("🍴 Refreshments") {
                    SectionGrid(HousekeepingSections.foodRefreshments) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
                PremiumSectionCard("🔑 Special") {
                    SectionGrid(HousekeepingSections.specialRequests) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
                PremiumSectionCard("Miscellaneous") {
                    SectionGrid(HousekeepingSections.miscellanious) { option ->
                        selectedRequest = option
                        showDialog = true
                    }
                }
            }
        }
    }

    if (showDialog && selectedRequest != null) {
        ConfirmationDialog(
            request = selectedRequest!!,
            onDismiss = { showDialog = false },
            onConfirm = {
                showDialog = false
                Log.d("HouseKeeping", "Request raised: $selectedRequest")
                coroutineScope.launch {
                    val apiService = ApiService(context)

                    // amenity data
                    val housekeepingData = JSONObject().apply {
                        put("requestType", selectedRequest)
                    }

                    // Final request body
                    val requestBody = JSONObject().apply {
                        put("department", "HouseKeeping")
                        put("totalAmount", 0)
                        put("data", housekeepingData)
                    }

                    when (val result = apiService.post("request", requestBody)) {
                        is ApiResult.Success -> {
                            Log.d("HouseKeeping", "API Success for house keeping request - '${selectedRequest}'")
                            SnackbarManager.showMessage("House keeping request raised for '${selectedRequest}'", SnackbarType.SUCCESS)
                        }
                        is ApiResult.Error -> {
                            Log.d("HouseKeeping", "API Failed for house keeping request - '${selectedRequest}'")
                            SnackbarManager.showMessage("Something went wrong. Please try again later. Sorry :(", SnackbarType.ERROR)
                        }
                    }
                }
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
            .padding(2.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
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
