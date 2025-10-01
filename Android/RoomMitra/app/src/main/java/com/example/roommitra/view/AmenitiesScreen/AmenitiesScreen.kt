package com.example.roommitra.view

import AmenityDetail
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import com.example.roommitra.view.AmenitiesScreenService.getAmenities

@Composable
fun AmenitiesScreen(onBackClick: () -> Unit) {
    // List of amenities
    val amenities = getAmenities()
    var selectedAmenity by remember { mutableStateOf(amenities.first()) }

    Column(Modifier.fillMaxSize()) {
        // Sticky Top bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 12.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackClick) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Amenities",
                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                fontSize = 22.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
        }

        // Main content: left menu + right detail
        Row(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surface)
        ) {
            // Left side menu
            LazyColumn(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(220.dp)
//                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemsIndexed(amenities) { _, amenity ->
                    val isSelected = selectedAmenity == amenity
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(
                                if (isSelected)  MaterialTheme.colorScheme.surfaceVariant
                                else Color.White
                            )
                            .clickable { selectedAmenity = amenity }
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                    ) {
                        Icon(
                            imageVector = amenity.icon,
                            contentDescription = amenity.title,
                            tint = if (isSelected) MaterialTheme.colorScheme.primary
                            else MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = amenity.title,
                            fontWeight = if (isSelected)
                                androidx.compose.ui.text.font.FontWeight.Bold
                            else androidx.compose.ui.text.font.FontWeight.Medium,
                            fontSize = 17.sp,
                            color = if (isSelected) MaterialTheme.colorScheme.primary
                            else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            // Right side details
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .weight(1f)
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp)
            ) {
                AmenityDetail(
                    title = selectedAmenity.title,
                    description = selectedAmenity.description,
                    imageUrl = selectedAmenity.imageUrl,
                    onRegister = selectedAmenity.onRegister
                )
            }
        }
    }
}
