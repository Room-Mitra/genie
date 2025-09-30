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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

// ---- Data Model ----
data class DishInfo(
    val cost: Int,
    val description: String,
    val imgUrl: String? = null
)

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
            val price = menuData.values.flatten().firstOrNull { it.first == dish }?.second?.cost ?: 0
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

            LeftMenu(
                categories = categories,
                visibleCategory = visibleCategory,
                categoryIndexMap = categoryIndexMap,
                coroutineScope = coroutineScope,
                mainListState = mainListState
            )

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
                                    val dishInfo = dish.second
                                    val count = cart[dishName] ?: 0

                                    DishCard(
                                        dishName = dishName,
                                        dishPrice = dishInfo.cost,
                                        description = dishInfo.description,
                                        imgUrl = dishInfo.imgUrl,
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
    description: String,
    imgUrl: String? = null,
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
                    .size(150.dp)
                    .background(Color(0xFFE0E0E0), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                if (!imgUrl.isNullOrEmpty()) {
                    AsyncImage(
                        model = imgUrl,
                        contentDescription = dishName,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Icon(
                        Icons.Default.Fastfood,
                        contentDescription = "Dish Image",
                        tint = Color.Gray,
                        modifier = Modifier.size(60.dp)
                    )
                }
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
                        description,
                        fontSize = 13.sp,
                        color = Color.Gray,
                        maxLines = 4
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
    menuData: Map<String, List<Pair<String, DishInfo>>>,
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
                            .firstOrNull { it.first == dish }?.second?.cost ?: 0
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
fun getRestaurantMenuData(): Map<String, List<Pair<String, DishInfo>>> {
    return mapOf(
        "Soups" to listOf(
            "Pumpkin Soup" to DishInfo(
                cost = 160,
                imgUrl = "https://www.recipetineats.com/tachyon/2017/10/Pumpkin-Soup-2.jpg?resize=500%2C500",
                description = "A creamy, puréed soup made from cooked pumpkin, blended with stock, broth, onions, and garlic."
            ),
            "Lemon Coriander Soup" to DishInfo(
                cost = 180,
                imgUrl = "https://i0.wp.com/www.shanazrafiq.com/wp-content/uploads/2020/02/Lemon-Coriander-Soup-3.jpg?resize=681%2C1024&ssl=1",
                description = "A tangy and refreshing soup made with lemon, coriander, and spices."
            ),
            "Cream of Broccoli" to DishInfo(
                cost = 190,
                description = "A smooth and creamy broccoli soup, lightly seasoned.",
                imgUrl = "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR1BY3pXhJFhDTEPXtlTFVnKNjKTOO8PHgEsvhYdcKS2-CslxL8znjJaHqtm83KC4fUqCy0aq5wESTeZM3PBx8yPKxKoGqoRVaOxb_8hAxA"
            ),
            "Tomato Basil Soup" to DishInfo(
                cost = 170,
                imgUrl = "https://www.twospoons.ca/wp-content/uploads/2021/02/vegan-tomato-basil-soup-recipe-creamy-twospoons-8.jpg",
                description = "Classic tomato soup blended with fresh basil and cream."
            ),
            "Mushroom Soup" to DishInfo(
                cost = 200,
                imgUrl = "https://www.allrecipes.com/thmb/PKh_MtthZMtG1flNmud0MNgRK7w=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/13096-Cream-of-Mushroom-Soup-ddmfs-4x3-293-b505e37374d74e81807e8a93bcdd7bab.jpg",
                description = "Creamy mushroom soup with sautéed mushrooms and garlic."
            )
        ),
        "Salads" to listOf(
            "Green Salad" to DishInfo(160, "Fresh mix of lettuce, cucumber, and tomato","https://www.allrecipes.com/thmb/XgWHycCFMP4eAvMfKXnX3pzC_DA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ALR-14452-green-salad-VAT-hero-4x3-22eb1ac6ccd14e5bacf18841b9672313.jpg"),
            "Greek Salad" to DishInfo(190, "Traditional Greek salad with feta and olives", "https://hips.hearstapps.com/hmg-prod/images/greek-salad-index-642f292397bbf.jpg?crop=0.888888888888889xw:1xh;center,top&resize=1200:*"),
            "Caesar Salad" to DishInfo(210, "Crisp romaine with Caesar dressing, croutons, and parmesan","https://www.noracooks.com/wp-content/uploads/2022/06/vegan-caesar-salad-4.jpg"),
            "Quinoa Salad" to DishInfo(200, "Healthy quinoa salad with veggies and lemon dressing","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXBdbSa1Uk-5jGhPNZDrgfcG94c7P0eZfzXw&s"),
            "Fruit Salad" to DishInfo(180, "Mixed seasonal fruits with a honey dressing","https://cdn.loveandlemons.com/wp-content/uploads/2025/06/fruit-salad.jpg")
        ),
        "Starters" to listOf(
            "Spring Rolls" to DishInfo(150, "Crispy vegetable spring rolls with sweet chili sauce", "https://d1mxd7n691o8sz.cloudfront.net/static/recipe/recipe/2023-12/Vegetable-Spring-Rolls-2-1-906001560ca545c8bc72baf473f230b4.jpg"),
            "Chicken Wings" to DishInfo(250, "Spicy grilled chicken wings with dip"),
            "Paneer Tikka" to DishInfo(220, "Grilled marinated paneer cubes with spices", "https://spicecravings.com/wp-content/uploads/2020/10/Paneer-Tikka-Featured-1.jpg"),
            "Stuffed Mushrooms" to DishInfo(200, "Mushrooms stuffed with cheese and herbs"),
            "Potato Wedges" to DishInfo(150, "Crispy potato wedges served with ketchup")
        ),
        "Indian" to listOf(
            "Butter Chicken" to DishInfo(280, "Creamy tomato-based chicken curry", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN2jh7DvoLtDyDF6cigDHFrSMs5zMpaXRelA&s"),
            "Paneer Butter Masala" to DishInfo(250, "Soft paneer cubes in rich tomato gravy"),
            "Chole Bhature" to DishInfo(220, "Spicy chickpea curry served with fried bread"),
            "Dal Makhani" to DishInfo(200, "Black lentils cooked with butter and cream"),
            "Biryani" to DishInfo(300, "Fragrant basmati rice cooked with meat or vegetables")
        ),
        "Asian" to listOf(
            "Fried Rice" to DishInfo(180, "Classic stir-fried rice with vegetables", "https://www.indianhealthyrecipes.com/wp-content/uploads/2020/12/fried-rice.jpg"),
            "Noodles" to DishInfo(170, "Stir-fried noodles with vegetables and sauce"),
            "Sushi Platter" to DishInfo(400, "Assorted sushi rolls with wasabi and soy sauce"),
            "Thai Green Curry" to DishInfo(350, "Spicy Thai curry with coconut milk and vegetables"),
            "Teriyaki Chicken" to DishInfo(300, "Grilled chicken glazed with teriyaki sauce")
        ),
        "Desserts" to listOf(
            "Chocolate Lava Cake" to DishInfo(180, "Warm chocolate cake with molten center", "https://5.imimg.com/data5/SELLER/Default/2024/5/416116214/ZW/QX/PC/132900754/chocolava-cake-500x500.jpeg"),
            "Cheesecake" to DishInfo(200, "Creamy cheesecake with a biscuit base"),
            "Gulab Jamun" to DishInfo(150, "Soft deep-fried dumplings soaked in sugar syrup"),
            "Ice Cream Sundae" to DishInfo(160, "Vanilla ice cream with chocolate syrup and nuts"),
            "Brownie" to DishInfo(170, "Fudgy chocolate brownie with nuts")
        ),
        "Pizzas" to listOf(
            "Margherita" to DishInfo(250, "Classic pizza with tomato, basil, and mozzarella", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNr7zUqgp12aK197H2CUHRibru1a7sM3RZKA&s"),
            "Pepperoni" to DishInfo(300, "Pizza topped with pepperoni and cheese"),
            "Veggie Supreme" to DishInfo(280, "Loaded with mixed vegetables and cheese"),
            "BBQ Chicken" to DishInfo(320, "Grilled chicken with BBQ sauce and cheese"),
            "Paneer Tikka Pizza" to DishInfo(300, "Paneer cubes with Indian spices on pizza")
        ),
        "Burgers" to listOf(
            "Classic Veg Burger" to DishInfo(150, "Veg patty with lettuce, tomato, and sauce"),
            "Cheese Burger" to DishInfo(200, "Beef patty with cheese, lettuce, and tomato"),
            "Paneer Burger" to DishInfo(180, "Grilled paneer with sauces and veggies"),
            "Chicken Burger" to DishInfo(220, "Grilled chicken patty with cheese and veggies"),
            "Double Patty Burger" to DishInfo(250, "Two beef patties with cheese and sauces")
        ),
        "Cocktails" to listOf(
            "Mojito" to DishInfo(250, "Classic mint and lime cocktail", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtwaP80FlMnpCynYz-Vu68aYlTL6lR1dJZ2A&s"),
            "Margarita" to DishInfo(280, "Tequila-based cocktail with lime and salt"),
            "Cosmopolitan" to DishInfo(300, "Vodka, triple sec, cranberry juice, and lime"),
            "Pina Colada" to DishInfo(320, "Rum, coconut cream, and pineapple juice"),
            "Long Island Iced Tea" to DishInfo(350, "Mixed spirits with cola and lemon")
        ),
        "Beverages" to listOf(
            "Cold Coffee" to DishInfo(120, "Chilled coffee with milk and sugar"),
            "Lemonade" to DishInfo(100, "Refreshing lemon drink with mint"),
            "Masala Chai" to DishInfo(80, "Spiced Indian tea with milk"),
            "Orange Juice" to DishInfo(110, "Freshly squeezed orange juice"),
            "Smoothie" to DishInfo(150, "Mixed fruit smoothie with yogurt")
        )
    )
}

