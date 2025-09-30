package com.example.roommitra.view

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
    val menuData = RestaurantMenuService.getRestaurantMenuData()
    val categories = menuData.keys.toList()

    var cart by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
    val mainListState = remember { LazyListState() }
    val columns = 2
    val coroutineScope = rememberCoroutineScope()

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

    val calculateTotal: () -> Int = {
        cart.entries.sumOf { (dish, count) ->
            val price = menuData.values.flatten().firstOrNull { it.first == dish }?.second?.cost ?: 0
            price * count
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {

        // Top bar
        TopBar(onBackClick)

        Row(modifier = Modifier.weight(1f)) {
            LeftMenu(
                categories = categories,
                visibleCategory = visibleCategory,
                categoryIndexMap = categoryIndexMap,
                coroutineScope = coroutineScope,
                mainListState = mainListState
            )

            MenuList(
                menuData = menuData,
                categories = categories,
                cart = cart,
                onCartChange = { cart = it },
                mainListState = mainListState,
                columns = columns
            )
        }

        CartButton(cart = cart, calculateTotal = calculateTotal, onClick = { showCartPopup = true })
    }

    if (showCartPopup) {
        CartPopup(
            cart = cart,
            menuData = menuData,
            calculateTotal = calculateTotal,
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

// ------------------------ TopBar ------------------------
@Composable
fun TopBar(onBackClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = { onBackClick() }) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
        }
        Text(
            "Restaurant Menu",
            fontWeight = FontWeight.SemiBold,
            fontSize = 20.sp
        )
    }
}

// ------------------------ MenuList ------------------------
@Composable
fun MenuList(
    menuData: Map<String, List<Pair<String, DishInfo>>>,
    categories: List<String>,
    cart: Map<String, Int>,
    onCartChange: (Map<String, Int>) -> Unit,
    mainListState: LazyListState,
    columns: Int
) {
    LazyColumn(
        state = mainListState,
        modifier = Modifier
//            .weight(1f)
            .fillMaxHeight()
    ) {
        categories.forEach { category ->
            item(key = category) {
                Text(
                    category,
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
                                onIncrease = { onCartChange(cart + (dishName to (count + 1))) },
                                onDecrease = {
                                    if (count > 0) onCartChange(cart.toMutableMap().apply {
                                        this[dishName] = count - 1
                                        if (this[dishName] == 0) remove(dishName)
                                    })
                                },
                                modifier = Modifier.weight(1f)
                            )
                        }
                        if (rowItems.size < columns) repeat(columns - rowItems.size) { Spacer(modifier = Modifier.weight(1f)) }
                    }
                }
            }
        }
    }
}

// ------------------------ CartButton ------------------------
@Composable
fun CartButton(cart: Map<String, Int>, calculateTotal: () -> Int, onClick: () -> Unit) {
    if (cart.isNotEmpty()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.primary)
                .padding(12.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.ShoppingCart, contentDescription = "Cart", tint = Color.White)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                "₹${calculateTotal()} - View Cart & Add Instructions",
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable { onClick() }
            )
        }
    }
}
