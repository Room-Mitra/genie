package com.example.roommitra.view

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage

@Composable
fun DishCard(
    dishName: String,
    dishPrice: Int,
    description: String,
    imgUrl: String? = null,
    count: Int,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .height(180.dp)
            .shadow(4.dp, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(modifier = Modifier.fillMaxSize().padding(12.dp)) {

            Box(
                modifier = Modifier
                    .size(150.dp)
                    .background(Color(0xFFE0E0E0), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                if (!imgUrl.isNullOrEmpty()) {
                    AsyncImage(
                        model = imgUrl,
                        contentDescription = dishName,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Icon(Icons.Default.Fastfood, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(60.dp))
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(
                modifier = Modifier.weight(1f).fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(dishName, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, maxLines = 2)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(description, fontSize = 13.sp, color = Color.Gray, maxLines = 4)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("₹$dishPrice", fontWeight = FontWeight.Medium, color = Color.Gray)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onDecrease, enabled = count > 0) { Icon(Icons.Default.Remove, contentDescription = "Decrease") }
                        Text(text = count.toString(), modifier = Modifier.width(28.dp), textAlign = TextAlign.Center)
                        IconButton(onClick = onIncrease) { Icon(Icons.Default.Add, contentDescription = "Increase") }
                    }
                }
            }
        }
    }
}
