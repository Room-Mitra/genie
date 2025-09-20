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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color

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
            WidgetCard("My Notifications", Icons.Default.Notifications) { },
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
            columns = GridCells.Fixed(4), // smaller widgets, more per row
            verticalArrangement = Arrangement.spacedBy(12.dp),
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

        Spacer(Modifier.height(20.dp))

        // --- Special widgets at the bottom ---
//        NotificationsCard(unreadCount = 3, titles = listOf("Room Service ready"))
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
                Deal("Kayak in the Banasura Lake", "https://picsum.photos/600/300?2"),
                Deal("Private Party invite for members", "https://media.istockphoto.com/id/501387734/photo/dancing-friends.jpg?s=1024x1024&w=is&k=20&c=qneEFMVnKvFkagvbMmZqYU1rLRweq9889MXbu6f8mO4=" ),
                Deal("Try Cocktails in our  Beach Bar", "https://picsum.photos/600/300?3")
            )
        )

    }
}


//@Composable
//fun NotificationsCard(unreadCount: Int, titles: List<String>) {
//    Card(
//        shape = RoundedCornerShape(16.dp),
//        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
//        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
//        modifier = Modifier.fillMaxWidth()
//    ) {
//        Row(
//            modifier = Modifier.padding(12.dp),
//            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
//        ) {
//            BadgedBox(badge = {
//                if (unreadCount > 0) {
//                    Badge { Text(unreadCount.toString()) }
//                }
//            }) {
//                Icon(Icons.Default.Notifications, contentDescription = "Notifications")
//            }
//            Spacer(Modifier.width(12.dp))
//            Column {
//                titles.take(2).forEach { title ->
//                    Text(title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
//                }
//                if (titles.size > 2) {
//                    Text("+${titles.size - 2} more", style = MaterialTheme.typography.bodySmall)
//                }
//            }
//        }
//    }
//}
@Composable
fun OrderStatusCard(orders: List<Order>) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "Your Orders",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            // Horizontal Scroll
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(orders) { order ->
                    OrderItemCard(order)
                }
            }
        }
    }
}

@Composable
fun OrderItemCard(order: Order) {
    Card(
        modifier = Modifier
            .width(140.dp)
            .height(100.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(10.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = order.icon,
                contentDescription = order.title,
                modifier = Modifier.size(28.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Text(
                text = order.title,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 1
            )
            Text(
                text = "${order.status} (${order.eta})",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )
        }
    }
}


data class Order(
    val title: String,
    val status: String,
    val eta: String,
    val icon: ImageVector
)




data class WidgetCard(
    val title: String,
    val icon: ImageVector,
    val onClick: () -> Unit
)
