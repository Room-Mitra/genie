package com.example.roommitra.view

import android.annotation.SuppressLint
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import com.example.roommitra.service.PollingManager
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import kotlin.collections.component1
import kotlin.collections.component2

@SuppressLint("UnusedBoxWithConstraintsScope")
@Composable
fun RestaurantMenuScreen(onBackClick: () -> Unit) {
    val restaurantMenuRepo = PollingManager.getRestaurantMenuRepository()
    val menuData by restaurantMenuRepo.menuData.collectAsState()

    val sections = menuData?.optJSONArray("sections") ?: JSONArray()
    val categories = remember(sections) {
        List(sections.length()) { i -> sections.getJSONObject(i).getString("name") }
    }

    var selectedCategoryIndex by remember { mutableStateOf(0) }
    val itemCounts = remember { mutableStateMapOf<String, Int>() }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    var showCartDialog by remember { mutableStateOf(false) }
    var specialInstructions by remember { mutableStateOf("") }

    LaunchedEffect(listState.firstVisibleItemIndex) {
        selectedCategoryIndex = listState.firstVisibleItemIndex.coerceAtMost(categories.lastIndex)
    }

    val context = LocalContext.current
    fun placeOrder(selectedItems: Map<String, Int>){
        val requestJson = JSONObject().apply {
            put("cart", JSONObject().apply {
                put("items", JSONArray().apply {
                    selectedItems.forEach { (itemId, qty) ->
                        put(JSONObject().apply {
                            put("itemId", itemId)
                            put("quantity", qty)
                        })
                    }
                })
            })
            put("instruction", specialInstructions)
        }
        Log.d("RestaurantMenu","API Request: $requestJson")
        coroutineScope.launch {
            val apiService = ApiService(context)
            val result = apiService.post("restaurant/order", requestJson)
            Log.d("RestaurantMenu", "ApiResult = $result")

            when (result) {
                is ApiResult.Success -> {
                    Log.d("RestaurantMenu", "API Success for Restaurant order - '${requestJson}'")
                    SnackbarManager.showMessage("Restaurant order placed successfully ", SnackbarType.SUCCESS)
                }
                is ApiResult.Error -> {
                    Log.d("RestaurantMenu", "API Failed for Restaurant order - '${requestJson}'")
                    SnackbarManager.showMessage("Something went wrong. Please try again later. Sorry :(", SnackbarType.ERROR)
                }
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize()) {
            TopBar(onBackClick)

            Row(modifier = Modifier.fillMaxSize().background(Color.White)) {
                CategoryList(
                    categories = categories,
                    selectedIndex = selectedCategoryIndex,
                    onCategoryClick = { index ->
                        selectedCategoryIndex = index
                        coroutineScope.launch { listState.scrollToItem(index) }
                    }
                )
                MenuList(
                    sections = sections,
                    itemCounts = itemCounts,
                    listState = listState
                )
            }
        }

        if (itemCounts.values.sum() > 0) {
            FloatingActionButton(
                onClick = { showCartDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp)
            ) {
                Icon(Icons.Default.ShoppingCart, contentDescription = "Cart")
            }
        }

        if (showCartDialog) {
            CartDialog(
                sections = sections,
                itemCounts = itemCounts,
                specialInstructions = specialInstructions,
                onSpecialInstructionsChange = { specialInstructions = it },
                onDismiss = { showCartDialog = false },
                onPlaceOrder = { selectedItems ->showCartDialog = false; specialInstructions = ""; placeOrder(selectedItems)}
//                onPlaceOrder = (selectedItems){ showCartDialog = false; specialInstructions = ""; placeOrder(selectedItems)}
            )
        }
    }
}

@Composable
fun TopBar(onBackClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(12.dp),
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

@SuppressLint("RememberInComposition")
@Composable
fun CategoryList(
    categories: List<String>,
    selectedIndex: Int,
    onCategoryClick: (Int) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .width(200.dp)
            .fillMaxHeight()
            .background(MaterialTheme.colorScheme.surface)
            .padding(vertical = 16.dp)
    ) {
        items(categories.size) { index ->
            val isSelected = index == selectedIndex
            Text(
                text = categories[index],
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                        else Color.Transparent
                    )
                    .clickable(
                        interactionSource = MutableInteractionSource(),
                        indication = null
                    ) { onCategoryClick(index) }
                    .padding(8.dp),
                fontSize = 14.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Black
            )
        }
    }
}

@SuppressLint("UnusedBoxWithConstraintsScope")
@Composable
fun MenuList(
    sections: JSONArray,
    itemCounts: MutableMap<String, Int>,
    listState: androidx.compose.foundation.lazy.LazyListState
) {
    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxHeight().padding(8.dp)
    ) {
        items((0 until sections.length()).toList()) { sectionIndex ->
            val sectionObj = sections.getJSONObject(sectionIndex)
            val sectionName = sectionObj.optString("name")
            val itemsArray = sectionObj.optJSONArray("items") ?: JSONArray()

            Text(
                text = sectionName,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(vertical = 8.dp)
            )

            BoxWithConstraints {
                val rows = (itemsArray.length() + 1) / 2
                val itemHeight = 190.dp
                val totalHeight = (rows * itemHeight.value + (rows - 1) * 8).dp

                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.height(totalHeight).fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    userScrollEnabled = false
                ) {
                    items((0 until itemsArray.length()).map { itemsArray.getJSONObject(it) }) { itemObj ->
                        val itemId = itemObj.optString("itemId")
                        val count = itemCounts[itemId] ?: 0
                        MenuItemCard(
                            item = itemObj,
                            count = count,
                            onIncrease = { itemCounts[itemId] = count + 1 },
                            onDecrease = { if (count > 0) itemCounts[itemId] = count - 1 }
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun MenuItemCard(
    item: JSONObject,
    count: Int,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit
) {
    val imageUrl = item.optJSONObject("image")?.optString("url") ?: ""
    val name = item.optString("name")
    val description = item.optString("description")
    val price = item.optString("unitPrice")

    Card(
        modifier = Modifier.fillMaxWidth().height(180.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(modifier = Modifier.fillMaxSize().padding(12.dp)) {
            Box(
                modifier = Modifier.size(140.dp).background(Color(0xFFE0E0E0), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                if (imageUrl.isNotEmpty()) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = name,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Icon(Icons.Default.Fastfood, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(40.dp))
                }
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column(
                modifier = Modifier.weight(1f).fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(name, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(description, fontSize = 13.sp, color = Color.Gray, maxLines = 3, overflow = TextOverflow.Ellipsis)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("₹$price", fontWeight = FontWeight.Medium, color = Color.Gray)
                    Spacer(modifier = Modifier.width(190.dp))
                    IconButton(onClick = onDecrease, enabled = count > 0) { Icon(Icons.Default.Remove, contentDescription = "Decrease") }
                    Text(count.toString(), modifier = Modifier.width(28.dp), textAlign = TextAlign.Center)
                    IconButton(onClick = onIncrease) { Icon(Icons.Default.Add, contentDescription = "Increase") }
                }
            }
        }
    }
}

@Composable
fun CartDialog(
    sections: JSONArray,
    itemCounts: MutableMap<String, Int>,
    specialInstructions: String,
    onSpecialInstructionsChange: (String) -> Unit,
    onDismiss: () -> Unit,
    onPlaceOrder: (selectedItems: Map<String, Int>) -> Unit
) {
    val selectedItems = remember(itemCounts.toMap()) { itemCounts.filter { it.value > 0 } }



    Dialog(onDismissRequest = { onDismiss() }) {
        Card(
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth().padding(16.dp).background(Color.White)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Cart", fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))

                LazyColumn(modifier = Modifier.heightIn(max = 300.dp).fillMaxWidth()) {
                    items(selectedItems.entries.toList()) { (itemId, qty) ->
                        val itemObj = (0 until sections.length()).flatMap { sIndex ->
                            val itemsArray = sections.getJSONObject(sIndex).optJSONArray("items") ?: JSONArray()
                            (0 until itemsArray.length()).map { i -> itemsArray.getJSONObject(i) }
                        }.firstOrNull { it.optString("itemId") == itemId }

                        itemObj?.let { obj ->
                            val name = obj.optString("name")
                            val price = obj.optString("unitPrice").toDoubleOrNull() ?: 0.0
                            CartItemRow(
                                name = name,
                                price = price,
                                quantity = qty,
                                onIncrease = { itemCounts[itemId] = qty + 1 },
                                onDecrease = { if (qty > 0) itemCounts[itemId] = qty - 1 }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = specialInstructions,
                    onValueChange = onSpecialInstructionsChange,
                    placeholder = { Text("Special instructions") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                val grandTotal = selectedItems.entries.sumOf { (itemId, qty) ->
                    val price = (0 until sections.length()).flatMap { sIndex ->
                        val itemsArray = sections.getJSONObject(sIndex).optJSONArray("items") ?: JSONArray()
                        (0 until itemsArray.length()).map { i -> itemsArray.getJSONObject(i) }
                    }.firstOrNull { it.optString("itemId") == itemId }?.optString("unitPrice")?.toDoubleOrNull() ?: 0.0
                    price * qty
                }

                Text("Grand Total: ₹${"%.2f".format(grandTotal)}", fontWeight = FontWeight.Bold, modifier = Modifier.padding(vertical = 4.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Button(onClick = onDismiss) { Text("Cancel") }
                    Button(onClick = { itemCounts.clear() }) { Text("Clear Cart") }
                    Button(onClick = {
                        onPlaceOrder(selectedItems)
                        itemCounts.clear()
                    }) { Text("Place Order") }
                }
            }
        }
    }
}
@Composable
fun CartItemRow(
    name: String,
    price: Double,
    quantity: Int,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Name takes available space
        Text(
            name,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(1f),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )

        Spacer(modifier = Modifier.width(8.dp))

        // Total price + quantity controls
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {

            IconButton(
                onClick = onDecrease,
                enabled = quantity > 0,
                modifier = Modifier.size(32.dp)
            ) {
                Icon(Icons.Default.Remove, contentDescription = "Decrease")
            }

            Text(
                quantity.toString(),
                modifier = Modifier.width(28.dp),
                textAlign = TextAlign.Center
            )

            IconButton(
                onClick = onIncrease,
                modifier = Modifier.size(32.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Increase")
            }
            Spacer(modifier = Modifier.width(8.dp))

            Text(
                "₹${"%.2f".format(price * quantity)}",
                fontWeight = FontWeight.Medium
            )


        }
    }
}
