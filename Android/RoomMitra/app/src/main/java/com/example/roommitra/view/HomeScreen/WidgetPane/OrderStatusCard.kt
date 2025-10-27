package com.example.roommitra.view.WidgetPane

import androidx.compose.animation.AnimatedContent
import androidx.compose.foundation.LocalIndication
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.roommitra.service.PollingManager
import org.json.JSONArray
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

data class Order(
    val title: String,
    val status: String,
    val eta: String,
    val icon: ImageVector
)
@Composable
fun OrderStatusCard() {

    val bookingRepo = PollingManager.getBookingRepository()
    val bookingData by bookingRepo.bookingData.collectAsState()
    val requests = bookingData?.optJSONArray("requests") ?: JSONArray()
    val orders = remember(requests.toString()) {
        mapRequestsToOrders(requests)
    }
    var selectedOrder by remember { mutableStateOf<Order?>(null) }
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
        ) {
            Text(
                text = "Your Requests",
                style = MaterialTheme.typography.titleMedium.copy(
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold
                ),
                modifier = Modifier.padding(bottom = 12.dp)
            )

            AnimatedContent(
                targetState = orders.isEmpty(),
                label = "order-list-transition"
            ) { isEmpty ->
                if (isEmpty) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Inbox,
                            contentDescription = "No orders",
                            modifier = Modifier.size(40.dp),
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "You have not placed any orders yet",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            ),
                            textAlign = TextAlign.Center
                        )
                    }
                } else {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(orders) { order ->
                            OrderItemCard(order){
                                selectedOrder = order
                            }
                        }
                    }
                }
            }
            // Show popup if an order is selected
            selectedOrder?.let { order ->
                OrderDetailDialog(order = order, onDismiss = { selectedOrder = null })
            }
        }
    }
}

@Composable
fun OrderItemCard(order: Order, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .width(150.dp)
            .height(110.dp)
            .clickable(
                indication = LocalIndication.current, // Add this line
                interactionSource = remember { MutableInteractionSource() }
            )  { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(10.dp),
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
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "${order.status} • ${order.eta}",
                style = MaterialTheme.typography.bodySmall.copy(
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                ),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}


fun mapRequestsToOrders(requests: JSONArray): List<Order> {
    val orders = mutableListOf<Order>()

    for (i in 0 until requests.length()) {
        val req = requests.optJSONObject(i) ?: continue

        val requestType = req.optString("requestType", "Request")
        val status = req.optString("status", "Pending")
        val etaRaw = req.optString("estimatedTimeOfFulfillment", "")
        val department = req.optString("department", "")
        val orderObj = req.optJSONObject("order")

        // Convert ETA (ISO string) → readable text like “15m” (optional; placeholder for now)
        val eta = if (etaRaw.isNotEmpty()) "15m" else "--"

        // Choose icon intelligently
        val icon: ImageVector = when {
            department.contains("Room Service", ignoreCase = true) -> Icons.Default.Restaurant
            department.contains("Housekeeping", ignoreCase = true) -> Icons.Default.LocalLaundryService
            department.contains("Laundry", ignoreCase = true) -> Icons.Default.LocalLaundryService
            department.contains("Taxi", ignoreCase = true) -> Icons.Default.DirectionsCar
            else -> Icons.Default.Assignment
        }

        // If request has an order object, use the first item’s name as title
        val title = orderObj?.optJSONArray("items")
            ?.optJSONObject(0)
            ?.optString("name", requestType)
            ?: requestType

        orders.add(
            Order(
                title = title,
                status = status.replaceFirstChar { it.uppercase() },
                eta = eta,
                icon = icon
            )
        )
    }

    return orders
}

@Composable
fun OrderDetailDialog(order: Order, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = { onDismiss() },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        },
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = order.icon,
                    contentDescription = order.title,
                    modifier = Modifier
                        .size(24.dp)
                        .padding(end = 8.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = order.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
                )
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("Status: ${order.status}", style = MaterialTheme.typography.bodyMedium)
                Text("Estimated time: ${order.eta}", style = MaterialTheme.typography.bodyMedium)
                Divider(modifier = Modifier.padding(vertical = 4.dp))
                Text(
                    "More details about this request will appear here.",
                    style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray)
                )
            }
        },
        shape = RoundedCornerShape(16.dp),
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 6.dp
    )
}



