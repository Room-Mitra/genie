package com.example.roommitra.view

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Celebration
import androidx.compose.material.icons.filled.ChildCare
import androidx.compose.material.icons.filled.Coffee
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.MeetingRoom
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Pool
import androidx.compose.material.icons.filled.Spa
import androidx.compose.material.icons.filled.Terrain

// Data model
data class Amenity(
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val onRegister: (() -> Unit)? = null
)

object AmenitiesScreenService {
    fun getAmenities(): List<Amenity> {
        return  listOf(
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
    }
}

