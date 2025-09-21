package com.example.roommitra.view

import android.util.Log
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RestaurantMenuScreen(
    onBackClick: () -> Unit = {},
) {
    val menuData = getRestaurantMenuData()
    val categories = menuData.keys.toList()

    var cart by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
    val mainListState = remember { LazyListState() }
    val coroutineScope = rememberCoroutineScope()
    val columns = 2

    val categoryIndexMap = remember {
        val map = mutableMapOf<String, Int>()
        var index = 0
        categories.forEach { category ->
            map[category] = index
            val rows = menuData[category]!!.chunked(columns)
            index += rows.size + 1
        }
        map
    }

    val visibleCategory by remember {
        derivedStateOf {
            val firstVisible = mainListState.firstVisibleItemIndex
            categories.lastOrNull { categoryIndexMap[it] ?: 0 <= firstVisible } ?: categories.first()
        }
    }

    var showCartPopup by remember { mutableStateOf(false) }

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
                title = { Text("Restaurant Menu", fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = { onBackClick() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            if (cart.isNotEmpty()) {
                FloatingActionButton(
                    containerColor = MaterialTheme.colorScheme.primary,
                    onClick = { showCartPopup = true }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 12.dp)
                    ) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "Cart", tint = Color.White)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            "₹${calculateTotal()}",
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    ) { paddingValues ->

        Row(modifier = Modifier.fillMaxSize().padding(paddingValues)) {

            // ✅ Reusable Left Menu Composable
            LeftMenu(
                categories = categories,
                visibleCategory = visibleCategory,
                categoryIndexMap = categoryIndexMap,
                coroutineScope = coroutineScope,
                mainListState = mainListState
            )

            // Main Menu List
            LazyColumn(
                state = mainListState,
                modifier = Modifier.weight(1f).fillMaxHeight()
            ) {
                categories.forEach { category ->
                    item(key = category) {
                        Text(
                            text = category,
                            fontSize = 22.sp,
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
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                rowItems.forEach { dish ->
                                    val dishName = dish.first
                                    val dishPrice = dish.second
                                    val count = cart[dishName] ?: 0

                                    DishCard(
                                        dishName = dishName,
                                        dishPrice = dishPrice,
                                        count = count,
                                        onIncrease = { cart = cart + (dishName to (count + 1)) },
                                        onDecrease = {
                                            if (count > 0) {
                                                cart = cart.toMutableMap().apply {
                                                    this[dishName] = count - 1
                                                    if (this[dishName] == 0) remove(dishName)
                                                }
                                            }
                                        },
                                        modifier = Modifier.weight(1f)
                                    )

                                }

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

    // ✅ Reusable Cart Popup Composable
    if (showCartPopup) {
        CartPopup(
            cart = cart,
            menuData = menuData,
            calculateTotal = { calculateTotal() },
            onPlaceOrder = {
                Log.d("RestaurantMenu", "Order placed: $cart")
                showCartPopup = false
            },
            onClearCart = {
                cart = emptyMap()
                showCartPopup = false
            },
            onDismiss = { showCartPopup = false }
        )
    }
}


@Composable
fun DishCard(
    dishName: String,
    dishPrice: Int,
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
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(150.dp) // bigger image
                    .background(Color(0xFFE0E0E0), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.Fastfood,
                    contentDescription = "Dish Image",
                    tint = Color.Gray,
                    modifier = Modifier.size(60.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        dishName,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 16.sp,
                        maxLines = 2
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "Delicious ${dishName.lowercase()} prepared fresh",
                        fontSize = 13.sp,
                        color = Color.Gray,
                        maxLines = 2
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "₹$dishPrice",
                        fontWeight = FontWeight.Medium,
                        color = Color.Gray
                    )

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { onDecrease() },
                            enabled = count > 0
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = "Decrease")
                        }

                        Text(
                            text = count.toString(),
                            modifier = Modifier.width(28.dp),
                            textAlign = TextAlign.Center
                        )

                        IconButton(onClick = { onIncrease() }) {
                            Icon(Icons.Default.Add, contentDescription = "Increase")
                        }
                    }
                }
            }
        }
    }
}




@Composable
fun LeftMenu(
    categories: List<String>,
    visibleCategory: String,
    categoryIndexMap: Map<String, Int>,
    coroutineScope: CoroutineScope,
    mainListState: LazyListState
) {
    val scrollState = rememberScrollState()

    Box(
        modifier = Modifier
            .width(200.dp)
            .fillMaxHeight()
            .background(MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .verticalScroll(scrollState)
                .padding(end = 4.dp)
        ) {
            categories.forEach { category ->
                val isSelected = category == visibleCategory
                Text(
                    text = category,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) Color.White else Color.Black,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp, horizontal = 12.dp)
                        .background(
                            if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent,
                            shape = RoundedCornerShape(8.dp)
                        )
                        .clickable {
                            categoryIndexMap[category]?.let { targetIndex ->
                                coroutineScope.launch {
                                    mainListState.scrollToItem(targetIndex)
                                }
                            }
                        },
                    textAlign = TextAlign.Center
                )
            }
        }

        // Optional: thin scroll indicator for overflow
        if (scrollState.maxValue > 0) {
            val proportion = scrollState.value.toFloat() / scrollState.maxValue.toFloat()
            val thumbHeight = 40.dp
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(4.dp)
                    .background(Color.Gray.copy(alpha = 0.2f))
                    .align(Alignment.CenterEnd)
            ) {
                Box(
                    modifier = Modifier
                        .width(4.dp)
                        .height(thumbHeight)
                        .background(Color.Gray)
                        .align(Alignment.TopCenter)
                        .offset(y = (proportion * (scrollState.maxValue.dp.value)).dp)
                )
            }
        }
    }
}


@Composable
fun CartPopup(
    cart: Map<String, Int>,
    menuData: Map<String, List<Pair<String, Int>>>,
    calculateTotal: () -> Int,
    onPlaceOrder: () -> Unit,
    onClearCart: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                "Your Cart",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = MaterialTheme.colorScheme.primary
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (cart.isEmpty()) {
                    Text(
                        "Your cart is empty.",
                        fontSize = 16.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(vertical = 16.dp)
                    )
                } else {
                    cart.forEach { (dish, count) ->
                        val price = menuData.values.flatten()
                            .firstOrNull { it.first == dish }?.second ?: 0
                        val itemTotal = price * count

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(dish, fontWeight = FontWeight.Medium, fontSize = 16.sp)
                                Text("x$count", color = Color.Gray, fontSize = 13.sp)
                            }
                            Text(
                                "₹$itemTotal",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 15.sp,
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }

                        Divider(thickness = 0.5.dp, color = Color(0xFFE0E0E0))
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Total",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        Text(
                            "₹${calculateTotal()}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onPlaceOrder,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Place Order", color = Color.White, fontWeight = FontWeight.SemiBold)
            }
        },
        dismissButton = {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onClearCart,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Clear Cart")
                }
                OutlinedButton(
                    onClick = onDismiss,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Cancel")
                }
            }
        }
    )
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

