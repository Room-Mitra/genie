package com.example.roommitra.view

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.roommitra.view.ConciergeScreenService.getConciergeScreenData

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConciergeScreen(onBackClick: () -> Unit) {

    val services = getConciergeScreenData()
    var selectedService by remember { mutableStateOf(services.first()) }

    Column() {
        // Top App Bar
        TopBarConcierge(onBackClick)

        // Main content row
        Row(
            modifier = Modifier
                .fillMaxSize()
        ) {
            ConciergeMenu(
                services = services,
                selectedService = selectedService,
                onServiceSelected = { selectedService = it }
            )

            ConciergeDetail(
                title = selectedService.title,
                description = selectedService.description,
                imageUrl = selectedService.imageUrl,
                tags = selectedService.tags,
                onRequest = selectedService.onRequest
            )
        }
    }
}


@Composable
fun TopBarConcierge(onBackClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = { onBackClick() }) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
        }
        Text(
            "Concierge Menu",
            fontWeight = FontWeight.SemiBold,
            fontSize = 20.sp
        )
    }
}