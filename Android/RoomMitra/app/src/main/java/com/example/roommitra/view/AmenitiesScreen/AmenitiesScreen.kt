package com.example.roommitra.view

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.roommitra.R
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AmenitiesScreen( onBackClick: () -> Unit) {
    // List of amenities
    val amenities = listOf(
        Amenity(
            title = "Swimming Pool",
            description = "Open daily from 6 AM to 10 PM. Towels are available at the poolside.",
//            imageRes = R.drawable.ic_pool, // replace with your asset
            onRegister = null
        ),
        Amenity(
            title = "Spa & Wellness",
            description = "Relax and rejuvenate with our signature treatments. Bookings are required.",
//            imageRes = R.drawable.ic_spa, // replace with your asset
            onRegister = { /* Handle spa registration */ }
        ),
        Amenity(
            title = "Guided Nature Walk",
            description = "Join our naturalist every morning at 7 AM for a guided walk through the forest.",
//            imageRes = R.drawable.ic_nature, // replace with your asset
            onRegister = { /* Handle walk registration */ }
        ),
        Amenity(
            title = "Fitness Center",
            description = "State-of-the-art equipment available 24/7. Trainers available 9 AM - 7 PM.",
//            imageRes = R.drawable.ic_gym, // replace with your asset
            onRegister = null
        )
    )

    var selectedAmenity by remember { mutableStateOf(amenities.first()) }


    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Amenities") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Row(
            Modifier
                .fillMaxSize()
                .padding(paddingValues) // 👈 respect scaffold insets
        ) {
            // Left side menu
            LazyColumn(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(200.dp)
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(amenities.size) { index ->
                    val amenity = amenities[index]
                    Surface(
                        tonalElevation = if (selectedAmenity == amenity) 4.dp else 0.dp,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedAmenity = amenity }
                    ) {
                        Text(
                            text = amenity.title,
                            modifier = Modifier.padding(12.dp),
                            style = MaterialTheme.typography.bodyLarge.copy(
                                fontWeight = if (selectedAmenity == amenity) FontWeight.Bold else FontWeight.Normal
                            ),
                            color = if (selectedAmenity == amenity)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            // Right side details
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .weight(1f)
                    .padding(16.dp)
            ) {
                AmenityDetail(
                    title = selectedAmenity.title,
                    description = selectedAmenity.description,
                    imageRes = selectedAmenity.imageRes,
                    onRegister = selectedAmenity.onRegister
                )
            }
        }
    }
}


@Composable
fun AmenityDetail(
    title: String,
    description: String,
    imageRes: Int? = null,
    onRegister: (() -> Unit)? = null
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )

        if (imageRes != null) {
            Image(
                painter = painterResource(id = imageRes),
                contentDescription = title,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .background(Color.LightGray, RoundedCornerShape(12.dp))
            )
        }

        Text(
            text = description,
            style = MaterialTheme.typography.bodyLarge
        )

        if (onRegister != null) {
            Button(
                onClick = onRegister,
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Register")
            }
        }
    }
}

// Data model
data class Amenity(
    val title: String,
    val description: String,
    val imageRes: Int? = null,
    val onRegister: (() -> Unit)? = null
)
