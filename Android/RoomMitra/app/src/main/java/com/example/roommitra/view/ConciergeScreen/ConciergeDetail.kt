package com.example.roommitra.view

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.time.LocalDateTime

@Composable
fun ConciergeDetail(
    title: String,
    description: String,
    imageUrl: String? = null,
    tags: List<String> = emptyList(),
    isRegistrationNeeded: Boolean
) {
    var showDialog by remember { mutableStateOf(false) }
    var bookingDateTime by remember { mutableStateOf<LocalDateTime?>(null) }

    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    Column(
        modifier = Modifier
            .fillMaxHeight()
//            .weight(1f)
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold)
        )

        if (tags.isNotEmpty()) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
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
                contentScale = androidx.compose.ui.layout.ContentScale.Crop
            )
        }

        Text(
            text = description,
            style = MaterialTheme.typography.bodyLarge.copy(fontSize = 16.sp, lineHeight = 22.sp)
        )

        if (isRegistrationNeeded === true) {
            Button(
                onClick = { showDialog = true  },
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Request", fontWeight = FontWeight.Bold)
            }
            if (showDialog) {
                DateTimePickerDialog(
                    onDismiss = { showDialog = false },
                    onConfirm = { selected ->
                        bookingDateTime = selected
                        showDialog = false
                        Log.d("ConciergeBooking", "Trying to book ${title} for ${bookingDateTime}")
                        coroutineScope.launch {
                            val apiService = ApiService(context)

                            // Concierge data
                            val conciergeData = JSONObject().apply {
                                put("bookingDateTime", bookingDateTime.toString())
                                put("conciergeType", title)
                            }

                            // Final request body
                            val requestBody = JSONObject().apply {
                                put("department", "Concierge")
                                put("totalAmount", 0)
                                put("data", conciergeData)
                            }

                            when (val result = apiService.post("request", requestBody)) {
                                is ApiResult.Success -> {
                                    Log.d("ConciergeBooking", "${title} booked for ${bookingDateTime}")
                                    SnackbarManager.showMessage("${title} booked for ${bookingDateTime!!.toLocalDate()} at ${bookingDateTime!!.toLocalTime()}", SnackbarType.SUCCESS)
                                }
                                is ApiResult.Error -> {
                                    Log.d("ConciergeBooking", "Failed to book ${title} for ${bookingDateTime}")
                                    SnackbarManager.showMessage("Something went wrong. Please try again later. Sorry :(", SnackbarType.ERROR)
                                }
                            }
                        }
                    }
                )
            }
        }
    }
}
