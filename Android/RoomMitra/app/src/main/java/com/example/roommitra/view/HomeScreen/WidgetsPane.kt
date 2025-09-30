package com.example.roommitra.view

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
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
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

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
            WidgetCard("Concierge", Icons.Default.DirectionsCar) {  navController.navigate("concierge")},
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
            columns = GridCells.Fixed(5), // smaller widgets, more per row
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
                Deal("Book your passes for the New Year Party @ Rs.3000/couple !", "https://static.vecteezy.com/system/resources/thumbnails/038/361/246/small_2x/ai-generated-concert-crowd-raising-hands-in-unison-under-bright-stage-lights-free-photo.jpg" ),
                Deal("Get VIP Dussehra Passes!", "https://www.vtiger.com/blog/wp-content/uploads/2022/10/Dasara-Feature-image-3-1.png")
            )
        )

    }
}

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
                text = "Your Requests",
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

data class Deal(
    val title: String,
    val imageUrl: String
)




@OptIn(ExperimentalFoundationApi::class)
@Composable
fun DealsCardSlideshow(deals: List<Deal>) {
    val pagerState = rememberPagerState(pageCount = { deals.size })
    val scope = rememberCoroutineScope()

    // Auto-scroll every 30s
    LaunchedEffect(pagerState.currentPage) {
        delay(30_000L) // 30 seconds
        val nextPage = (pagerState.currentPage + 1) % deals.size
        scope.launch {
            pagerState.animateScrollToPage(nextPage)
        }
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier
            .fillMaxWidth()
            .height(450.dp)
    ) {
        Box {
            // Single pager
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxSize()
            ) { page ->
                DealsCard(deals[page]) // render only one deal at a time
            }

            // Page indicator (dots)
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(8.dp),
                horizontalArrangement = Arrangement.Center
            ) {
                repeat(pagerState.pageCount) { index ->
                    val isSelected = pagerState.currentPage == index
                    Box(
                        modifier = Modifier
                            .padding(4.dp)
                            .size(if (isSelected) 10.dp else 8.dp)
                            .background(
                                if (isSelected) MaterialTheme.colorScheme.primary
                                else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                shape = RoundedCornerShape(50)
                            )
                    )
                }
            }
        }
    }
}

@Composable
fun DealsCard(deal: Deal) {
    Box {
        AsyncImage(
            model = deal.imageUrl,
            contentDescription = deal.title,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomStart)
                .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.7f))
                .padding(14.dp)
        ) {
            Text(
                deal.title,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

