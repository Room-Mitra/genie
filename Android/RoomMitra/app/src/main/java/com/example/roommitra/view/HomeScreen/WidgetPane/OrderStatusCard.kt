package com.example.roommitra.view.WidgetPane

import android.util.Log
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
import com.example.roommitra.data.DepartmentType
import com.example.roommitra.data.RequestStatus
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import kotlin.text.format

data class Order(
    val title: String,
    val status: RequestStatus?,
    val eta: String,
    val createdAt:String,
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
            .padding(horizontal = 8.dp),
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
                            text = "You have not placed any requests yet",
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
                            OrderItemCard(order) {
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
                indication = LocalIndication.current,
                interactionSource = remember { MutableInteractionSource() }
            ) { onClick() },
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
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            StatusPill(status = order.status)

        }
    }
}


fun mapRequestsToOrders(requests: JSONArray): List<Order> {
    val orders = mutableListOf<Order>()

    for (i in 0 until requests.length()) {
        val req = requests.optJSONObject(i) ?: continue
        Log.d("OrderStatusCard", "Request: $req")
        val department = req.optString("department", "")
        val requestType = req.optString("requestType", "Request")
        val etaRaw = req.optString("estimatedTimeOfFulfillment", "")
//        val status = req.optString("status", "Pending")
        val statusKey = req.optString("status", "in_progress")
        val statusEnum = RequestStatus.fromKey(statusKey)

        val createdAt = req.optString("createdAt", "")

        // Choose icon intelligently
        val icon: ImageVector = when {
            department.contains(
                DepartmentType.ROOM_SERVICE.key,
                ignoreCase = true
            ) -> Icons.Default.Restaurant

            department.contains(
                DepartmentType.HOUSEKEEPING.key,
                ignoreCase = true
            ) -> Icons.Default.RoomService

            department.contains(
                DepartmentType.FRONT_OFFICE.key,
                ignoreCase = true
            ) -> Icons.Default.SupportAgent

            department.contains(
                DepartmentType.CONCIERGE.key,
                ignoreCase = true
            ) -> Icons.Default.DirectionsCar

            department.contains(
                DepartmentType.FACILITIES.key,
                ignoreCase = true
            ) -> Icons.Default.Build

            department.contains(
                DepartmentType.GENERAL_ENQUIRY.key,
                ignoreCase = true
            ) -> Icons.Default.ContactSupport

            else -> Icons.Default.Assignment
        }

        // If request has an order object, use the first item’s name as title
        val orderObj = req.optJSONObject("order")
        val title = orderObj?.optJSONArray("items")
            ?.optJSONObject(0)
            ?.optString("name", requestType)
            ?: requestType

        orders.add(
            Order(
                title = title,
                status = statusEnum,
                eta = etaRaw,
                icon = icon,
                createdAt = createdAt
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

@Composable
fun StatusPill(status: RequestStatus?) {
    val (bgColor, textColor, label) = when (status) {
        RequestStatus.UNACKNOWLEDGED -> Triple(Color(0xFFEEEFF2), Color.Gray, "Order Placed")
        RequestStatus.IN_PROGRESS -> Triple(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f), MaterialTheme.colorScheme.primary, "In Progress")
        RequestStatus.DELAYED -> Triple(Color(0xFFFFE0B2), Color(0xFFD84315), "Delayed")
        RequestStatus.COMPLETED -> Triple(Color(0xFFD0F0C0), Color(0xFF2E7D32), "Completed")
        null -> Triple(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f), MaterialTheme.colorScheme.primary, "In Progress")
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(50),
        tonalElevation = 0.dp
    ) {
        Text(
            text = label,
            color = textColor,
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
            modifier = Modifier
                .padding(horizontal = 8.dp, vertical = 4.dp),
            maxLines = 1
        )
    }
}


