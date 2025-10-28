package com.example.roommitra.view.WidgetPane

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.navigation.NavHostController
import com.example.roommitra.service.TrackingService

@Composable
fun WidgetsPane(
    modifier: Modifier = Modifier,
    navController: NavHostController
) {
    fun widgetClickHandler(widgetName: String) {
        TrackingService.getInstance().trackEvent("widget_click", mapOf("widgetName" to widgetName)
        )
        Log.d("TrackingService", "Widget clicked: $widgetName")
        navController.navigate(widgetName)
    }

    val cards = remember {
        listOf(
            WidgetCard("Restaurant", Icons.Default.Restaurant) { widgetClickHandler("menu") },
            WidgetCard(   "Entertainment",   Icons.Default.Movie ) { widgetClickHandler("entertainment") },
            WidgetCard("Amenities", Icons.Default.Pool) { widgetClickHandler("amenities") },
            WidgetCard( "Housekeeping", Icons.Default.CleaningServices) { widgetClickHandler("housekeeping") },
            WidgetCard("Concierge", Icons.Default.DirectionsCar) { widgetClickHandler("concierge") }
//            WidgetCard("Your Requests", Icons.Default.ListAlt) { },
//            WidgetCard("Reception", Icons.Default.Call) { },
//            WidgetCard("My Notifications", Icons.Default.Notifications) { },
//            WidgetCard("Emergency", "Call Ambulance, Fire Services etc") { },
//            WidgetCard("Deals", "Show offers in exchange for reviews") { },
//            WidgetCard("DND", "Stop listening, dont play sounds, dim display to 0%") { },
//            WidgetCard("News", "Read / listen / see news") { },
//            WidgetCard("Select language", "Call Ambulance, Fire Services etc") { },
//            WidgetCard("Notifications", "check notifications from hotel") { },
//            WidgetCard("Smart Devices", Icons.Default.Lightbulb) { },
//            WidgetCard("Hotel Maps", "Call Ambulance, Fire Services etc") { },
        )
    }

    Column(modifier = modifier.padding(10.dp)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            cards.forEach { card ->
                Card(
                    onClick = card.onClick,
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier
                        .weight(1f) //  makes all cards equal width
                        .aspectRatio(1f) //  keeps them square
                ) {
                    Column(
                        modifier = Modifier
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

        Spacer(Modifier.height(20.dp))
        Spacer(Modifier.height(12.dp))

        OrderStatusCard()


        Spacer(Modifier.height(12.dp))

        DealsCardSlideshow()
    }
}
