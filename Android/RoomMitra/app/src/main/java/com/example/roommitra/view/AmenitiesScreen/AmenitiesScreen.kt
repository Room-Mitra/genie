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
import androidx.compose.ui.text.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AmenitiesScreen(onBackClick: () -> Unit) {

    // List of amenities with inline annotation tags
    val amenities = listOf(
        Amenity(
            title = "Swimming Pool",
            description = "Dive into our sparkling outdoor swimming pool, open daily from <Primary>6 AM to 10 PM</Primary>. " +
                    "Guests can enjoy sun loungers, plush towels, and personalized poolside service. " +
                    "Sip refreshing cocktails from the exclusive pool bar while children enjoy a shallow play area. " +
                    "Perfect for families, fitness swimmers, or those simply seeking relaxation under the sun.",
            imageUrl = "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?q=80&w=1170&auto=format&fit=crop",
            icon = Icons.Default.Pool,
            onRegister = null
        ),
        Amenity(
            title = "Spa & Wellness",
            description = "Unwind with our luxurious Spa & Wellness center featuring massages, facials, steam baths, and Ayurvedic therapies. " +
                    "Our expert therapists curate treatments that harmonize body and mind. <Tertiary>Advance bookings</Tertiary> are recommended to secure your preferred time slot.",
            imageUrl = "https://imgk.timesnownews.com/story/1537276571-massage.PNG?tr=w-1200,h-900",
            icon = Icons.Default.Spa,
            onRegister = { /* Handle spa registration */ }
        ),
        Amenity(
            title = "Guided Nature Walk",
            description = "Join our professional naturalist every morning at <Primary>7 AM</Primary> for an immersive nature walk. " +
                    "Discover unique flora and fauna, hear stories about local wildlife, and breathe in the crisp morning air. " +
                    "An unforgettable experience for nature lovers and adventure seekers alike.",
            imageUrl = "https://images.pexels.com/photos/289327/pexels-photo-289327.jpeg",
            icon = Icons.Default.Terrain,
            onRegister = { /* Handle walk registration */ }
        ),
        Amenity(
            title = "Fitness Center",
            description = "Stay committed to your fitness regime at our <Primary>24/7</Primary> gym. " +
                    "Equipped with the latest cardio machines, free weights, and resistance training gear. " +
                    "Personal trainers are available daily from <Primary>9 AM to 7 PM</Primary> to guide you.",
            imageUrl = "https://t4.ftcdn.net/jpg/03/17/72/47/360_F_317724775_qHtWjnT8YbRdFNIuq5PWsSYypRhOmalS.jpg",
            icon = Icons.Default.FitnessCenter,
            onRegister = null
        ),
        Amenity(
            title = "Rooftop Lounge",
            description = "Experience breathtaking skyline views from our elegant rooftop lounge. " +
                    "Unwind with signature cocktails, gourmet light bites, and <Bold>live music</Bold> on weekends. " +
                    "The perfect setting for romantic evenings and stylish social gatherings.",
            imageUrl = "https://www.fourseasons.com/alt/img-opt/~70.1530.0,0000-168,2955-3000,0000-1687,5000/publish/content/dam/fourseasons/images/web/MUM/MUM_396_original.jpg",
            icon = Icons.Default.Celebration,
            onRegister = null
        ),
        Amenity(
            title = "Conference Room",
            description = "Our fully equipped conference room is ideal for business meetings, workshops, and corporate events. " +
                    "Featuring <Bold>high-speed internet</Bold>, AV equipment, and comfortable seating arrangements to ensure productive sessions.",
            imageUrl = "https://media.istockphoto.com/id/1363104923/photo/diverse-modern-office-businessman-leads-business-meeting-with-managers-talks-uses.jpg?s=612x612&w=0&k=20&c=R6-SufHacJ6bCnviq37kik2Jl6RMdECybcUpEoRuMLs=",
            icon = Icons.Default.MeetingRoom,
            onRegister = null
        ),
        Amenity(
            title = "Library & Reading Room",
            description = "Escape into a world of knowledge and stories in our library and reading room. " +
                    "Featuring a curated collection of <Bold>books</Bold>, comfortable seating, and quiet corners for uninterrupted reading and study.",
            imageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
            icon = Icons.Default.MenuBook,
            onRegister = null
        ),
        Amenity(
            title = "Kids Play Area",
            description = "Our safe and colorful kids play area offers slides, swings, and interactive games for children of all ages. " +
                    "<Primary>Supervised activity sessions</Primary> ensure your little ones have fun while you relax.",
            imageUrl = "https://images.unsplash.com/photo-1460788150444-d9dc07fa9dba?q=80&w=2070&auto=format&fit=crop",
            icon = Icons.Default.ChildCare,
            onRegister = null
        ),
        Amenity(
            title = "Café & Bakery",
            description = "Indulge your taste buds in freshly brewed <Primary>coffee</Primary>, pastries, and artisan breads at our on-site café and bakery. " +
                    "Perfect for breakfast, casual meetups, or an afternoon snack.",
            imageUrl = "https://cdn.prod.website-files.com/60414b21f1ffcdbb0d5ad688/66181abf2dbc25ec0de5b763_nathan-dumlao-gOn7dKcCWKg-unsplash.jpg",
            icon = Icons.Default.Coffee,
            onRegister = null
        )
    )

    var selectedAmenity by remember { mutableStateOf(amenities.first()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Amenities", fontWeight = FontWeight.Bold, fontSize = 22.sp) },
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
            // Left side menu
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
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = amenity.title,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 17.sp,
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
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        if (imageUrl != null) {
            AsyncImage(
                model = imageUrl,
                contentDescription = title,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(320.dp)
                    .clip(RoundedCornerShape(20.dp)),
                contentScale = ContentScale.Crop
            )
        }

        // Parse custom tags in description
        val annotatedDesc = parseDescription(description)

        Text(
            text = annotatedDesc,
            style = MaterialTheme.typography.bodyLarge.copy(
                fontSize = 18.sp,
                lineHeight = 28.sp
            )
        )

        if (onRegister != null) {
            Button(
                onClick = onRegister,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Reserve Now", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}

// Parses description with <Bold>, <Primary>, <Tertiary> tags
@Composable
fun parseDescription(desc: String): AnnotatedString {
    val builder = AnnotatedString.Builder()
    var cursor = 0
    val regex = Regex("<(Bold|Primary|Tertiary)>(.*?)</\\1>")

    regex.findAll(desc).forEach { match ->
        // Add text before match
        if (cursor < match.range.first) {
            builder.append(desc.substring(cursor, match.range.first))
        }

        val tag = match.groupValues[1]
        val content = match.groupValues[2]

        val style = when (tag) {
            "Bold" -> SpanStyle(fontWeight = FontWeight.Bold)
            "Primary" -> SpanStyle(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            "Tertiary" -> SpanStyle(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.tertiary
            )
            else -> SpanStyle()
        }

        builder.withStyle(style) { append(content) }

        cursor = match.range.last + 1
    }

    // Add remaining text
    if (cursor < desc.length) {
        builder.append(desc.substring(cursor))
    }

    return builder.toAnnotatedString()
}

// Data model
data class Amenity(
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val onRegister: (() -> Unit)? = null
)
