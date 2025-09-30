package com.example.roommitra.view

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.RoundedCornerShape

@Composable
fun CartPopup(
    cart: Map<String, Int>,
    menuData: Map<String, List<Pair<String, DishInfo>>>,
    calculateTotal: () -> Int,
    onPlaceOrder: () -> Unit,
    onClearCart: () -> Unit,
    onDismiss: () -> Unit
) {
    var instructions by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Your Cart", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = MaterialTheme.colorScheme.primary) },
        text = {
            Column(modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (cart.isEmpty()) {
                    Text("Your cart is empty.", fontSize = 16.sp, color = Color.Gray, modifier = Modifier.padding(vertical = 16.dp))
                } else {
                    cart.forEach { (dish, count) ->
                        val price = menuData.values.flatten().firstOrNull { it.first == dish }?.second?.cost ?: 0
                        val itemTotal = price * count
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column { Text(dish, fontWeight = FontWeight.Medium, fontSize = 16.sp); Text("x$count", color = Color.Gray, fontSize = 13.sp) }
                            Text("₹$itemTotal", fontWeight = FontWeight.SemiBold, fontSize = 15.sp, color = MaterialTheme.colorScheme.secondary)
                        }
                        Divider(thickness = 0.5.dp, color = Color(0xFFE0E0E0))
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("₹${calculateTotal()}", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = MaterialTheme.colorScheme.primary)
                    }

                    OutlinedTextField(
                        value = instructions,
                        onValueChange = { instructions = it },
                        label = { Text("Special Instructions") },
                        placeholder = { Text("Eg: Make fried rice spicy") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = false,
                        maxLines = 3,
                        shape = RoundedCornerShape(8.dp)
                    )
                }
            }
        },
        confirmButton = {
            Button(onClick = onPlaceOrder, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary), shape = RoundedCornerShape(8.dp)) {
                Text("Place Order", color = Color.White, fontWeight = FontWeight.SemiBold)
            }
        },
        dismissButton = {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(onClick = onClearCart, shape = RoundedCornerShape(8.dp)) { Text("Clear Cart") }
                OutlinedButton(onClick = onDismiss, shape = RoundedCornerShape(8.dp)) { Text("Cancel") }
            }
        }
    )
}
