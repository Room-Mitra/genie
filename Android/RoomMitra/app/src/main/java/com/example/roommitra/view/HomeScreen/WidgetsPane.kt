package com.example.roommitra.view

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.navigation.NavHostController

@Composable
fun WidgetsPane(
    modifier: Modifier = Modifier,
    onUserInteraction: () -> Unit,
    navController: NavHostController
) {
    val cards = remember {
        listOf(
            WidgetCard(
                "Restaurant Menu",
                "Explore today’s specials"
            ) { navController.navigate("menu") },
            WidgetCard(
                "Entertainment",
                "Music, Games, Movies"
            ) { navController.navigate("entertainment") },
            WidgetCard(
                "Amenities",
                "Pool timings, spa, Nature walks"
            ) { navController.navigate("amenities") },
            WidgetCard("Housekeeping", "Towels, cleaning, water") { navController.navigate("housekeeping") },
            WidgetCard("Concierge", "Cabs, attractions, tips") { },
            WidgetCard("Track Requests", "See status of requests, current bills etc") { },
            WidgetCard("Reception", "Call / Chat with the reception") { },
            WidgetCard("Emergency", "Call Ambulance, Fire Services etc") { },
        )
    }

    Column(modifier = modifier.padding(24.dp)) {
        Text(
            "Quick Actions",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(Modifier.height(12.dp))
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(cards) { card ->
                Card(
                    onClick = card.onClick,
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1.6f)
                ) {
                    Column(
                        Modifier
                            .padding(16.dp)
                            .fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            card.title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            card.subtitle,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

data class WidgetCard(val title: String, val subtitle: String, val onClick: () -> Unit)
