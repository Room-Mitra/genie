package com.example.roommitra.view.data

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*

object HousekeepingSections {

    val roomCleaning = listOf(
        "Change Towels" to Icons.Default.LocalLaundryService,
        "Room Cleaning" to Icons.Default.CleaningServices,
        "Clean Bathroom" to Icons.Default.Bathroom,
        "Room Freshener" to Icons.Default.Spa,
    )

    val bedding = listOf(
        "Change Linen" to Icons.Default.Bed,
        "Extra Blanket" to Icons.Default.Checkroom,
        "Softer Pillows" to Icons.Default.Hotel,
        "Harder Pillows" to Icons.Default.Hotel,
    )

    val miscellanious = listOf(
        "Laundry Pickup" to Icons.Default.LocalLaundryService,
        "Shoe Cleaning" to Icons.Default.Checkroom,
        "Iron & Ironing Board" to Icons.Default.Iron,
        "Extra Toiletries" to Icons.Default.Spa,
        "Umbrella Request" to Icons.Default.Umbrella
    )

    val foodRefreshments = listOf(
        "Mini-Bar Refill" to Icons.Default.LocalBar,
        "Tea/Coffee Refill" to Icons.Default.Coffee,
        "Water Bottle" to Icons.Default.WaterDrop,
        "Fruit Basket" to Icons.Default.ShoppingBasket
    )

    val maintenanceRequests = listOf(
        "Fix Light" to Icons.Default.Build,
        "Fix Appliance" to Icons.Default.Build,
        "Plumbing Issue" to Icons.Default.Plumbing,
    )

    val specialRequests = listOf(
        "Do Not Disturb" to Icons.Default.DoNotDisturbOn,
        "Wake-up Call" to Icons.Default.Alarm
    )

    val checkoutOption = listOf(
        "Request Late Checkout" to Icons.Default.ExitToApp,
        "Initiate Checkout" to Icons.Default.ExitToApp,
    )
}
