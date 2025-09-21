package com.example.roommitra.view

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.text.style.TextAlign

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConciergeScreen(onBackClick: () -> Unit) {

    val services = listOf(
        ConciergeService(
            title = "Airport Pickup & Drop",
            description = "Enjoy hassle-free airport transfers with professional drivers in comfortable vehicles. Schedule pickup or drop-off according to your flight timings.",
            imageUrl = "https://www.shutterstock.com/shutterstock/photos/2054417627/display_1500/stock-photo-handsome-young-man-with-suitcase-getting-in-taxi-on-city-street-2054417627.jpg",
            icon = Icons.Default.DirectionsCar,
            tags = listOf("Private Vehicle", "On-demand", "Comfort"),
            onRequest = { /* Handle request */ }
        ),
        ConciergeService(
            title = "Restaurant Reservations",
            description = "Book tables at the best local and fine-dining restaurants. Popular spots include 'La Piazza' (Italian), 'Sushi World' (Japanese), 'Spice Route' (Indian), and bars like 'Skyline Lounge' and 'The Golden Hour'. Enjoy priority reservations and chef’s specials recommendations.",
            imageUrl = "https://media.gettyimages.com/id/1446478827/photo/a-chef-is-cooking-in-his-restaurants-kitchen.jpg?s=612x612&w=0&k=20&c=jwKJmGErrLe2XsTWNYEEyiNicudYVA4j8jvnTiJdp58=",
            icon = Icons.Default.Restaurant,
            tags = listOf("Italian", "Japanese", "Indian", "Rooftop Bar"),
            onRequest = { /* Handle request */ }
        ),
        ConciergeService(
            title = "Local Tours & Excursions",
            description = "Discover the city with guided tours and private excursions tailored to your interests. Options include heritage walks, night markets, boat tours, and adventure trekking.",
            imageUrl = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
            icon = Icons.Default.Tour,
            tags = listOf("Guided", "Private", "Cultural"),
            onRequest = { /* Handle request */ }
        ),
        ConciergeService(
            title = "Event & Party Planning",
            description = "Our concierge organizes private parties, corporate events, and intimate gatherings. We handle catering, venue setup, entertainment, and personalized themes.",
            imageUrl = "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            icon = Icons.Default.Celebration,
            tags = listOf("Corporate", "Private", "VIP"),
            onRequest = { /* Handle request */ }
        ),
        ConciergeService(
            title = "Spa & Wellness Appointments",
            description = "Book spa treatments, wellness sessions, massages, and yoga classes. Full-body rejuvenation, aromatherapy, and personalized care for a completely relaxed stay.",
            imageUrl = "https://as2.ftcdn.net/v2/jpg/01/87/29/35/1000_F_187293579_mPGjfd0YI3lAICz473ORPEPJ3rpFcPIE.jpg",
            icon = Icons.Default.Spa,
            tags = listOf("Massage", "Yoga", "Aromatherapy", "Couple"),
            onRequest = { /* Handle request */ }
        ),
        ConciergeService(
            title = "Special Requests",
            description = "From flowers and gifts to personalized surprises, our concierge fulfills your special requests to make your stay memorable. Examples include birthday arrangements, champagne, or curated gift baskets.",
            imageUrl = "https://www.shutterstock.com/image-photo/beautiful-delicate-flowers-bouquet-260nw-1698105454.jpg",
            icon = Icons.Default.LocalFlorist,
            tags = listOf("Personalized", "Gifts", "Flowers", "Date"),
            onRequest = { /* Handle request */ }
        ),
        ConciergeService(
            title = "Comedy & Theatre Tickets",
            description = "Get tickets for top local comedy clubs, plays, and theatrical performances. Examples: 'The Laugh Factory', 'Grand Stage Theatre', and 'City Players'. Concierge can book preferred seating and showtimes.",
            imageUrl = "https://static.vecteezy.com/system/resources/thumbnails/050/810/547/small_2x/comedian-performing-stand-up-show-on-stage-routine-in-comedy-club-photo.jpeg",
            icon = Icons.Default.Theaters,
            tags = listOf("Fun", "Comedy", "Drama", "Date"),
            onRequest = { /* Handle request */ }
        ),
        ConciergeService(
            title = "Concerts & Live Music",
            description = "Book tickets for live music events and concerts ranging from jazz, pop, classical, and rock. Venues include 'Symphony Hall', 'The Arena', and 'Open Air Stage'. Concierge can suggest VIP options.",
            imageUrl = "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
            tags = listOf("Fun", "Music", "Songs", "Dance"),
            icon = Icons.Default.MusicNote,
            onRequest = { /* Handle request */ }
        ),
        ConciergeService(
            title = "Nightlife & Bars",
            description = "Discover the best nightlife experiences. Book tables at top bars, rooftop lounges, or nightclubs. Examples: 'Skyline Lounge', 'Moonlight Rooftop', 'The Velvet Room'. Includes cocktail recommendations and timings.",
            imageUrl = "https://www.shutterstock.com/image-vector/night-bar-club-high-chair-600nw-2304087951.jpg",
            tags = listOf("Music", "Dance", "Cocktails", "Date"),
            icon = Icons.Default.Nightlife,
            onRequest = { /* Handle request */ }
        )
    )

    var selectedService by remember { mutableStateOf(services.first()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Concierge Services", fontWeight = FontWeight.Bold, fontSize = 20.sp) },
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
            // Left menu with icons
            LazyColumn(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(220.dp)
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                itemsIndexed(services) { _, service ->
                    val isSelected = selectedService == service
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedService = service }
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                    ) {
                        Icon(
                            imageVector = service.icon,
                            contentDescription = service.title,
                            tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = service.title,
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
                ConciergeDetail(
                    title = selectedService.title,
                    description = selectedService.description,
                    imageUrl = selectedService.imageUrl,
                    tags = selectedService.tags,
                    onRequest = selectedService.onRequest
                )
            }
        }
    }
}

@Composable
fun ConciergeDetail(
    title: String,
    description: String,
    imageUrl: String? = null,
    tags: List<String> = emptyList(),
    onRequest: (() -> Unit)? = null
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold)
        )

        // Tags row
        if (tags.isNotEmpty()) {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(tags.size) { index ->
                    Box(
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = tags[index],
                            color = MaterialTheme.colorScheme.primary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

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

        if (onRequest != null) {
            Button(
                onClick = onRequest,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Request", fontWeight = FontWeight.Bold)
            }
        }
    }
}

// Data model
data class ConciergeService(
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val icon: ImageVector,
    val tags: List<String> = emptyList(),
    val onRequest: (() -> Unit)? = null
)
