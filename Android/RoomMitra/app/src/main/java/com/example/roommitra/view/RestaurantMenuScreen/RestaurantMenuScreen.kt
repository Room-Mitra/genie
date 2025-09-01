package com.example.roommitra.view

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Preview
@Composable
fun RestaurantMenuScreen(
    onBackClick: () -> Unit = {}
) {
    val menuData = getRestaurantMenuData()
    val categories = menuData.keys.toList()

    var cart by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
    val listState = remember { LazyListState() }
    val coroutineScope = rememberCoroutineScope()
    val configuration = LocalConfiguration.current
    val columns = if (configuration.screenWidthDp > 600) 3 else 2

    // Left list scroll state
    val categoryListState = remember { LazyListState() }

    val categoryIndexMap = remember {
        val map = mutableMapOf<String, Int>()
        var index = 0
        categories.forEach { category ->
            map[category] = index
            index++ // category header
            val rows = menuData[category]!!.chunked(columns)
            index += rows.size // each row is 1 item
        }
        map
    }

    fun calculateTotal(): Int {
        var total = 0
        cart.forEach { (dish, count) ->
            val price = menuData.values.flatten().firstOrNull { it.first == dish }?.second ?: 0
            total += price * count
        }
        return total
    }

    Scaffold(
        topBar = {
            SmallTopAppBar(
                title = { Text("Menu") },
                navigationIcon = {
                    IconButton(onClick = { onBackClick() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            if (cart.isNotEmpty()) {
                FloatingActionButton(onClick = { /* Navigate to cart screen */ }) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 12.dp)
                    ) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "Cart")
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("₹${calculateTotal()}")
                    }
                }
            }
        }
    ) { innerPadding ->
        Row(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            // Left shortcuts column with scroll indicators
            Box(
                modifier = Modifier
                    .width(100.dp)
                    .fillMaxHeight()
                    .background(Color(0xFFF5F5F5))
            ) {
                LazyColumn(
                    state = categoryListState,
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(categories) { category ->
                        Text(
                            text = category,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp)
                                .clickable {
                                    coroutineScope.launch {
                                        categoryIndexMap[category]?.let { targetIndex ->
                                            listState.animateScrollToItem(targetIndex)
                                        }
                                    }
                                }
                        )
                    }
                }

                // Scroll Up indicator
                if (categoryListState.firstVisibleItemIndex > 0) {
                    Icon(
                        imageVector = Icons.Default.ArrowUpward,
                        contentDescription = "Scroll up",
                        tint = Color.Gray,
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(top = 4.dp)
                    )
                }

                // Scroll Down indicator
                val showDownArrow by remember {
                    derivedStateOf {
                        val lastVisible = categoryListState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
                        lastVisible < (categories.size - 1)
                    }
                }
                if (showDownArrow) {
                    Icon(
                        imageVector = Icons.Default.ArrowDownward,
                        contentDescription = "Scroll down",
                        tint = Color.Gray,
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 4.dp)
                    )
                }
            }

            // Main menu list with multiple items per row
            LazyColumn(
                state = listState,
                modifier = Modifier.weight(1f).fillMaxHeight()
            ) {
                categories.forEach { category ->
                    item(key = category) {
                        Text(
                            text = category,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(16.dp)
                        )
                    }

                    val dishes = menuData[category]!!
                    val rows = dishes.chunked(columns)

                    rows.forEach { rowItems ->
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 8.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                rowItems.forEach { dish ->
                                    val dishName = dish.first
                                    val dishPrice = dish.second
                                    val count = cart[dishName] ?: 0

                                    Card(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(120.dp) // fixed card height
                                            .padding(vertical = 4.dp),
                                        colors = CardDefaults.cardColors(containerColor = Color.White),
                                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                                    ) {
                                        Column(
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .padding(12.dp),
                                            verticalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                dishName,
                                                fontWeight = FontWeight.Medium,
                                                maxLines = 2
                                            )

                                            // Price + Counter in same row
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(
                                                    "₹$dishPrice",
                                                    fontSize = 14.sp,
                                                    color = Color.Gray
                                                )

                                                Row(verticalAlignment = Alignment.CenterVertically) {
                                                    IconButton(
                                                        onClick = {
                                                            if (count > 0) {
                                                                cart = cart.toMutableMap().apply {
                                                                    this[dishName] = count - 1
                                                                    if (this[dishName] == 0) remove(dishName)
                                                                }
                                                            }
                                                        },
                                                        enabled = count > 0
                                                    ) {
                                                        Icon(Icons.Default.Remove, contentDescription = "Decrease")
                                                    }

                                                    Text(
                                                        text = count.toString(),
                                                        modifier = Modifier.width(24.dp),
                                                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                                    )

                                                    IconButton(
                                                        onClick = {
                                                            cart = cart + (dishName to (count + 1))
                                                        }
                                                    ) {
                                                        Icon(Icons.Default.Add, contentDescription = "Increase")
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                // Fill empty space if row not full
                                if (rowItems.size < columns) {
                                    repeat(columns - rowItems.size) {
                                        Spacer(modifier = Modifier.weight(1f))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
// ---- Menu Data ----
fun getRestaurantMenuData(): Map<String, List<Pair<String, Int>>> {
    return mapOf(
        "Soups" to listOf(
            "Pumpkin Soup" to 160,
            "Lemon Coriander Soup" to 180,
            "Cream of Broccoli" to 190,
            "Sweet Corn (Veg)" to 180,
            "Sweet Corn (Chicken)" to 270,
            "Hot and Sour (Veg)" to 180,
            "Hot and Sour (Chicken)" to 270,
            "Manchow Soup (Veg)" to 180,
            "Manchow Soup (Chicken)" to 270
        ),
        "Salads" to listOf(
            "Green Salad" to 160,
            "Pineapple Mint Salad" to 180,
            "Greek Salad" to 190,
            "Hawaiian Chicken Salad" to 230
        ),
        "Starters" to listOf(
            "French Fries" to 160,
            "Nuggets (Veg)" to 220,
            "Veg Samosa" to 220,
            "Veg/Onion Pakora" to 140,
            "Cauliflower Ularathu" to 260,
            "Honey Chilly Potato" to 260,
            "Baby Corn Manchurian" to 310,
            "Paneer Hot Garlic" to 310,
            "Nuggets (Chicken)" to 260,
            "Chicken 65" to 380,
            "Chicken Malli Peralan" to 380,
            "Chicken Kondattam" to 380,
            "Chicken Lollipop" to 380,
            "Prawns Tawa Fry" to 450,
            "Mutton Pepper Fry" to 560,
            "Mutton Coconut Fry" to 560
        ),
        "Short Bites" to listOf(
            "Club Sandwich" to 220,
            "Veg Sandwich" to 160,
            "Chicken Sandwich" to 200,
            "Egg Sandwich" to 180,
            "Pakoras (Onion)" to 120,
            "Pakoras (Veg)" to 130,
            "Pakoras (Egg)" to 140,
            "Momos (Veg)" to 235,
            "Momos (Chicken)" to 260,
            "Kathi Roll (Paneer)" to 180,
            "Kathi Roll (Egg)" to 200,
            "Kathi Roll (Chicken)" to 220
        ),
        "Poultry" to listOf(
            "Chicken Mulagittathu" to 295,
            "Chicken Mappas" to 260,
            "Chicken Ghee Roast" to 280,
            "Nadan Chicken Curry" to 260,
            "Chicken Varutharachathu" to 260,
            "Chicken Rara Masala" to 280,
            "Kadai Chicken" to 295,
            "Butter Chicken Masala" to 295
        ),
        "Veggies" to listOf(
            "Kadai Veg" to 295,
            "Aloo Shimla" to 260,
            "Nilgiri Veg Korma" to 280,
            "Aloo Jeera" to 260,
            "Aloo Mutter Masala" to 260,
            "Veg Hyderabadi" to 280,
            "Paneer Butter Masala" to 295,
            "Palak Paneer" to 295,
            "Paneer Lazeez" to 295,
            "Bindi Masala" to 260,
            "Mushroom Masala" to 280,
            "Dal Tadka" to 225,
            "Panjabi Dal Tadka" to 250
        ),
        "Chinese" to listOf(
            "Hot Garlic Chicken" to 415,
            "Chilly Chicken" to 415,
            "Chicken Manchurian" to 415,
            "Dragon Chicken" to 415,
            "Schezwan Chicken" to 430,
            "Ginger Chicken" to 450,
            "Garlic Prawns" to 420,
            "Chilly Prawns" to 450,
            "Chilly Mushroom" to 380,
            "Cauliflower Manchurian" to 400,
            "Chilly Fish" to 400
        ),
        "Fish" to listOf(
            "Fish Tawa Fry (2 slices)" to 480,
            "Fish Mulagittathu" to 430,
            "Malabar Fish Curry" to 440,
            "Kerala Fish Curry" to 440,
            "Fish Moilee" to 450,
            "Fish Masala" to 450,
            "Prawns Roast" to 450,
            "Prawns Masala" to 450,
            "Prawns Ularthu" to 450
        ),
        "Local Cuisine" to listOf(
            "Pidi with Chicken Curry" to 550,
            "Bamboo Puttu Chicken" to 450,
            "Bamboo Puttu (Fish/Prawns)" to 500,
            "Bamboo Puttu (Paneer/Mushroom)" to 400,
            "Bamboo Puttu Mix Veg" to 375,
            "Paal Kappa with Veg Mappas" to 400,
            "Paal Kappa with Fish Curry" to 500,
            "Bamboo Biriyani Veg" to 400,
            "Bamboo Biriyani Chicken" to 500,
            "Bamboo Biriyani Fish/Prawns" to 500
        ),
        "Mutton" to listOf(
            "Mutton Rogan Josh" to 560,
            "Kollam Mutton Curry" to 540,
            "Mutton Korma" to 530,
            "Mutton Pepper Fry" to 560,
            "Mutton Masala" to 530
        ),
        "Bread" to listOf(
            "Kerala Paratha" to 35,
            "Nool Paratha" to 35,
            "Wheat Paratha" to 40,
            "Chappathi" to 25,
            "Phulka" to 20,
            "Appam" to 25
        ),
        "Rice and Noodles" to listOf(
            "Plain Rice" to 160,
            "Veg Pulao" to 250,
            "Peas Pulao" to 230,
            "Jeera Rice" to 200,
            "Tomato Rice" to 200,
            "Lemon Rice" to 200,
            "Veg Biriyani" to 320,
            "Curd Rice" to 220,
            "Ghee Rice" to 260,
            "Egg Biriyani" to 360,
            "Chicken Biriyani" to 400,
            "Mutton Biriyani" to 580,
            "Prawns Biriyani" to 500,
            "Fish Biriyani" to 450,
            "Veg Fried Rice" to 280,
            "Egg Fried Rice" to 280,
            "Chicken Fried Rice" to 300,
            "Schezwan Fried Rice" to 350,
            "Prawns Fried Rice" to 350,
            "Veg Noodles" to 310,
            "Egg Noodles" to 330,
            "Chicken Noodles" to 380,
            "Schezwan Noodles" to 400
        ),
        "Grilled" to listOf(
            "Grilled Chicken (Pepper/Chilli/Hariyali) Half" to 700,
            "Grilled Chicken (Pepper/Chilli/Hariyali) Full" to 1200,
            "Chicken Tikka (Malai/Red Chilli/Hariyali)" to 550,
            "Grilled Veg (Paneer/Mushroom)" to 400,
            "Fish Tikka (Basa)" to 450
        ),
        "Pasta" to listOf(
            "Alfredo Veg" to 330,
            "Alfredo Chicken" to 380,
            "Arrabbiata Veg" to 330,
            "Arrabbiata Chicken" to 380,
            "Rosso Veg" to 330,
            "Rosso Chicken" to 380
        ),
        "Desserts" to listOf(
            "Butter Banana Gulkand" to 260,
            "Palada with Ice Cream" to 250,
            "Gulab Jamun (2 nos)" to 250,
            "Gajar Ka Halwa" to 235,
            "Fruit Salad with Ice Cream" to 250,
            "Ice Cream (Single Scoop)" to 150
        ),
        "Drinks" to listOf(
            "Fresh Lime Soda/Water" to 80,
            "Virgin Mojito" to 140,
            "Virgin Mary" to 150,
            "Virgin Pina Colada" to 150,
            "Buttermilk" to 150
        ),
        "Milkshakes" to listOf(
            "Strawberry Milkshake" to 180,
            "Chocolate Milkshake" to 180,
            "Vanilla Milkshake" to 180,
            "Oreo Milkshake" to 180,
            "Banana Milkshake" to 180
        ),
        "Tea" to listOf(
            "Kerala Chai" to 50,
            "Ginger Masala Chai" to 80,
            "Iced Tea" to 80,
            "Lemon Tea" to 50
        ),
        "Coffee" to listOf(
            "Coffee" to 50,
            "Filter Coffee" to 80,
            "Iced Americano" to 140,
            "Cold Coffee" to 130
        )
    )
}

