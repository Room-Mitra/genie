package com.example.roommitra.view

import android.util.Log
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Celebration
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.LocalFlorist
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Nightlife
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Spa
import androidx.compose.material.icons.filled.Theaters
import androidx.compose.material.icons.filled.Tour
import androidx.compose.ui.graphics.vector.ImageVector


// ---- Menu Data ----
object ConciergeScreenService {
    fun getConciergeScreenData(): List<ConciergeService> {
        return listOf(
            ConciergeService(
                title = "Airport Pickup & Drop",
                description = "Enjoy hassle-free airport transfers with professional drivers in comfortable vehicles. Schedule pickup or drop-off according to your flight timings.",
                imageUrl = "https://media.istockphoto.com/id/519870714/photo/taxi.jpg?s=612x612&w=0&k=20&c=mzlqm5eisvu-B7hCyOK3LAsR4ugFTsHtC2kMWUmbA0Y=",
                icon = Icons.Default.DirectionsCar,
                tags = listOf("Private Vehicle", "On-demand", "Comfort"),
                isRegistrationNeeded = true
            ),
            ConciergeService(
                title = "Restaurant Reservations",
                description = "Book tables at the best local and fine-dining restaurants. Popular spots include 'La Piazza' (Italian), 'Sushi World' (Japanese), 'Spice Route' (Indian), and bars like 'Skyline Lounge' and 'The Golden Hour'. Enjoy priority reservations and chef’s specials recommendations.",
                imageUrl = "https://qul.imgix.net/8b728bde-7b55-44de-b928-84f5ac23545f/534341_sld.jpg",
                icon = Icons.Default.Restaurant,
                tags = listOf("Italian", "Japanese", "Indian", "Rooftop Bar"),
            ),
            ConciergeService(
                title = "Local Tours & Excursions",
                description = "Discover the city with guided tours and private excursions tailored to your interests. Options include heritage walks, night markets, boat tours, and adventure trekking.",
                imageUrl = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                icon = Icons.Default.Tour,
                tags = listOf("Guided", "Private", "Cultural"),
            ),
            ConciergeService(
                title = "Event & Party Planning",
                description = "Our concierge organizes private parties, corporate events, and intimate gatherings. We handle catering, venue setup, entertainment, and personalized themes.",
                imageUrl = "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                icon = Icons.Default.Celebration,
                tags = listOf("Corporate", "Private", "VIP"),
            ),
            ConciergeService(
                title = "Spa & Wellness Appointments",
                description = "Book spa treatments, wellness sessions, massages, and yoga classes. Full-body rejuvenation, aromatherapy, and personalized care for a completely relaxed stay.",
                imageUrl = "https://media.istockphoto.com/id/1479350890/photo/relax-spa-and-zen-woman-with-candles-for-beauty-physical-therapy-or-skincare-female-client-on.jpg?s=612x612&w=0&k=20&c=ODbmBr1IW1F21YC8pMvzytNnhZopOTRfFgulk7ISOqg=",
                icon = Icons.Default.Spa,
                tags = listOf("Massage", "Yoga", "Aromatherapy", "Couple"),
            ),
            ConciergeService(
                title = "Special Requests",
                description = "From flowers and gifts to personalized surprises, our concierge fulfills your special requests to make your stay memorable. Examples include birthday arrangements, champagne, or curated gift baskets.",
                imageUrl = "https://www.shutterstock.com/image-photo/beautiful-delicate-flowers-bouquet-260nw-1698105454.jpg",
                icon = Icons.Default.LocalFlorist,
                tags = listOf("Personalized", "Gifts", "Flowers", "Date"),
            ),
            ConciergeService(
                title = "Comedy & Theatre Tickets",
                description = "Get tickets for top local comedy clubs, plays, and theatrical performances. Examples: 'The Laugh Factory', 'Grand Stage Theatre', and 'City Players'. Concierge can book preferred seating and showtimes.",
                imageUrl = "https://static.vecteezy.com/system/resources/thumbnails/050/810/547/small_2x/comedian-performing-stand-up-show-on-stage-routine-in-comedy-club-photo.jpeg",
                icon = Icons.Default.Theaters,
                tags = listOf("Fun", "Comedy", "Drama", "Date"),
            ),
            ConciergeService(
                title = "Concerts & Live Music",
                description = "Book tickets for live music events and concerts ranging from jazz, pop, classical, and rock. Venues include 'Symphony Hall', 'The Arena', and 'Open Air Stage'. Concierge can suggest VIP options.",
                imageUrl = "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
                tags = listOf("Fun", "Music", "Songs", "Dance"),
                icon = Icons.Default.MusicNote,
            ),
            ConciergeService(
                title = "Nightlife & Bars",
                description = "Discover the best nightlife experiences. Book tables at top bars, rooftop lounges, or nightclubs. Examples: 'Skyline Lounge', 'Moonlight Rooftop', 'The Velvet Room'. Includes cocktail recommendations and timings.",
                imageUrl = "https://www.shutterstock.com/image-vector/night-bar-club-high-chair-600nw-2304087951.jpg",
                tags = listOf("Music", "Dance", "Cocktails", "Date"),
                icon = Icons.Default.Nightlife,
            )
        )
    }
}


// Data model
data class ConciergeService(
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val icon: ImageVector,
    val tags: List<String> = emptyList(),
    val isRegistrationNeeded: Boolean = false
)


