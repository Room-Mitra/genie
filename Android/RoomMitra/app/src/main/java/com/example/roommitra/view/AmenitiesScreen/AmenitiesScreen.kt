package com.example.roommitra.view

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AmenitiesScreen(onBackClick: () -> Unit) {

    // List of amenities with icons and internet images
    val amenities = listOf(
        Amenity(
            title = "Swimming Pool",
            description = "Dive into our sparkling outdoor swimming pool, open daily from 6 AM to 10 PM. Enjoy sun loungers and towels provided at the poolside, while sipping refreshing beverages from the pool bar. Ideal for families and relaxation enthusiasts.",
            imageUrl = "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            icon = Icons.Default.Pool,
            onRegister = null
        ),
        Amenity(
            title = "Spa & Wellness",
            description = "Unwind and rejuvenate with our premium spa services. Choose from massages, facials, and holistic wellness treatments designed to refresh your body and mind. Advance bookings are recommended to secure your preferred time slot.",
            imageUrl = "https://media.istockphoto.com/id/469916170/photo/young-woman-relaxing-during-back-massage-at-the-spa.jpg?s=2048x2048&w=is&k=20&c=EzzkrvZJSSMpNbjBas1ErRbETYxdjQQIklp3DI30zxo=",
            icon = Icons.Default.Spa,
            onRegister = { /* Handle spa registration */ }
        ),
        Amenity(
            title = "Guided Nature Walk",
            description = "Join our expert naturalist every morning at 7 AM for a serene walk through the lush forest surrounding the property. Learn about local flora and fauna and enjoy a peaceful connection with nature. Comfortable footwear is recommended.",
            imageUrl = "https://www.nps.gov/subjects/trails/images/family-hiking_2.jpg?maxwidth=650&autorotate=false&quality=78&format=webp",
            icon = Icons.Default.Terrain,
            onRegister = { /* Handle walk registration */ }
        ),
        Amenity(
            title = "Fitness Center",
            description = "Stay fit during your stay in our state-of-the-art fitness center, open 24/7. Featuring cardio machines, free weights, and personal trainers available from 9 AM to 7 PM. Suitable for beginners and fitness enthusiasts alike.",
            imageUrl = "https://media.istockphoto.com/id/2075354173/photo/fitness-couple-is-doing-kettlebell-twist-in-a-gym-togehter.jpg?s=2048x2048&w=is&k=20&c=i-npkSjUOeWQwp6pBtmeJ6EZ9EIUTE_CK2VTFcex-pY=",
            icon = Icons.Default.FitnessCenter,
            onRegister = null
        ),
        Amenity(
            title = "Rooftop Lounge",
            description = "Relax in our rooftop lounge while enjoying panoramic views of the city skyline. Enjoy signature cocktails, light bites, and a cozy ambiance perfect for evening unwinding or social gatherings.",
            imageUrl = "https://media.istockphoto.com/id/1198743919/photo/rooftop-restaurant.jpg?s=2048x2048&w=is&k=20&c=tQ67f1LASwQVC36ljGtJa68yj13P0PcURVEt0TJEPx8=",
            icon = Icons.Default.Celebration,
            onRegister = null
        ),
        Amenity(
            title = "Conference Room",
            description = "Our fully equipped conference room is ideal for business meetings, workshops, and corporate events. Featuring high-speed internet, AV equipment, and comfortable seating arrangements to ensure productive sessions.",
            imageUrl = "https://media.istockphoto.com/id/1363104923/photo/diverse-modern-office-businessman-leads-business-meeting-with-managers-talks-uses.jpg?s=612x612&w=0&k=20&c=R6-SufHacJ6bCnviq37kik2Jl6RMdECybcUpEoRuMLs=",
            icon = Icons.Default.MeetingRoom,
            onRegister = null
        ),
        Amenity(
            title = "Library & Reading Room",
            description = "Escape into a world of knowledge and stories in our library and reading room. Featuring a curated collection of books, comfortable seating, and quiet corners for uninterrupted reading and study.",
            imageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
            icon = Icons.Default.MenuBook,
            onRegister = null
        ),
        Amenity(
            title = "Kids Play Area",
            description = "Our safe and colorful kids play area offers slides, swings, and interactive games for children of all ages. Supervised activity sessions ensure your little ones have fun while you relax.",
            imageUrl = "https://images.unsplash.com/photo-1460788150444-d9dc07fa9dba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            icon = Icons.Default.ChildCare,
            onRegister = null
        ),
        Amenity(
            title = "Café & Bakery",
            description = "Indulge your taste buds in freshly brewed coffee, pastries, and artisan breads at our on-site café and bakery. Perfect for breakfast, casual meetups, or an afternoon snack.",
            imageUrl = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            icon = Icons.Default.Coffee,
            onRegister = null
        )
    )

    var selectedAmenity by remember { mutableStateOf(amenities.first()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Amenities", fontWeight = FontWeight.Bold, fontSize = 20.sp) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.smallTopAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { paddingValues ->
        Row(
            Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Left side menu with icons
            LazyColumn(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(220.dp)
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                itemsIndexed(amenities) { _, amenity ->
                    val isSelected = selectedAmenity == amenity
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedAmenity = amenity }
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                    ) {
                        Icon(
                            imageVector = amenity.icon,
                            contentDescription = amenity.title,
                            tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = amenity.title,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 16.sp,
                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            // Right side details
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .weight(1f)
                    .background(MaterialTheme.colorScheme.surfaceVariant)
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

@Composable
fun AmenityDetail(
    title: String,
    description: String,
    imageUrl: String? = null,
    onRegister: (() -> Unit)? = null
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold)
        )

        if (imageUrl != null) {
            AsyncImage(
                model = imageUrl,
                contentDescription = title,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
                    .clip(RoundedCornerShape(16.dp)),
                contentScale = ContentScale.Crop
            )
        }

        Text(
            text = description,
            style = MaterialTheme.typography.bodyLarge.copy(fontSize = 16.sp, lineHeight = 22.sp)
        )

        if (onRegister != null) {
            Button(
                onClick = onRegister,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Register", fontWeight = FontWeight.Bold)
            }
        }
    }
}

// Data model with icon
data class Amenity(
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val onRegister: (() -> Unit)? = null
)
