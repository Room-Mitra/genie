package com.example.roommitra.view

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.navigation.NavHostController
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*

@Composable
fun WidgetsPane(
    modifier: Modifier = Modifier,
    navController: NavHostController
) {
    val cards = remember {
        listOf(
            WidgetCard("Restaurant", Icons.Default.Restaurant) { navController.navigate("menu") },
            WidgetCard("Entertainment", Icons.Default.Movie) { navController.navigate("entertainment") },
            WidgetCard("Amenities", Icons.Default.Pool) { navController.navigate("amenities") },
            WidgetCard("Housekeeping", Icons.Default.CleaningServices) { navController.navigate("housekeeping") },
            WidgetCard("Concierge", Icons.Default.DirectionsCar) { },
            WidgetCard("Your Requests", Icons.Default.ListAlt) { },
            WidgetCard("Reception", Icons.Default.Call) { },
            //            WidgetCard("Emergency", "Call Ambulance, Fire Services etc") { },
//            WidgetCard("Deals", "Show offers in exchange for reviews") { },
//            WidgetCard("DND", "Stop listening, dont play sounds, dim display to 0%") { },
//            WidgetCard("News", "Read / listen / see news") { },
//            WidgetCard("Select language", "Call Ambulance, Fire Services etc") { },
//            WidgetCard("Notifications", "check notifications from hotel") { },
//            WidgetCard("smart devices", "turn on lights, see who is at the door") { },
//            WidgetCard("Hotel Maps", "Call Ambulance, Fire Services etc") { },

        )
    }

    Column(modifier = modifier.padding(16.dp)) {

        LazyVerticalGrid(
            columns = GridCells.Fixed(3), // smaller widgets, more per row
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(cards) { card ->
                Card(
                    onClick = card.onClick,
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1f) // square cards
                ) {
                    Column(
                        Modifier
                            .padding(8.dp)
                            .fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
                    ) {
                        Icon(
                            card.icon,
                            contentDescription = card.title,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(Modifier.height(6.dp))
                        Text(
                            card.title,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

data class WidgetCard(
    val title: String,
    val icon: ImageVector,
    val onClick: () -> Unit
)
