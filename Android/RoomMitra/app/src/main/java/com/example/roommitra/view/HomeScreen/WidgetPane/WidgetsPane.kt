package com.example.roommitra.view.WidgetPane

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
        TrackingService.getInstance().trackEvent(
            "widget_click",
            mapOf("widgetName" to widgetName)
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
        LazyVerticalGrid(
            columns = GridCells.Fixed(5),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.weight(1f, fill = false)
        ) {
            items(cards) { card ->
                Card(
                    onClick = card.onClick,
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1f)
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

        Spacer(Modifier.height(20.dp))
        Spacer(Modifier.height(12.dp))

        OrderStatusCard(
            orders = listOf(
                Order("Dinner", "Cooking", "15m", Icons.Default.Restaurant),
                Order("Laundry", "On the way", "5m", Icons.Default.LocalShipping),
                Order("Taxi", "Arriving", "2m", Icons.Default.DirectionsCar)
            )
        )

        Spacer(Modifier.height(12.dp))

        DealsCardSlideshow(
            deals = listOf(
                Deal("Kayak in the Banasura Sagar Lake", "https://picsum.photos/600/300?2"),
                Deal(
                    "Book your passes for the New Year Party @ Rs.3000/couple !",
                    "https://static.vecteezy.com/system/resources/thumbnails/038/361/246/small_2x/ai-generated-concert-crowd-raising-hands-in-unison-under-bright-stage-lights-free-photo.jpg"
                ),
                Deal(
                    "Get VIP Dussehra Passes!",
                    "https://www.vtiger.com/blog/wp-content/uploads/2022/10/Dasara-Feature-image-3-1.png"
                )
            )
        )
    }
}
