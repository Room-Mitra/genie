package com.example.roommitra.view

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import coil.compose.AsyncImage
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.withStyle
import com.example.roommitra.data.DepartmentType
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import com.example.roommitra.service.PollingManager
import com.example.roommitra.service.SessionManager
import kotlinx.coroutines.launch
import org.json.JSONObject


@Composable
fun ConciergeScreen(onBackClick: () -> Unit) {
    val scope = rememberCoroutineScope()

    val hotelInfoRepo = PollingManager.getHotelInfoRepository()
    val hotelData by hotelInfoRepo.hotelData.collectAsState()
    val conciergeArray = hotelData?.optJSONArray("concierge")

    // Parse concierge from JSON if available
    val concierge = remember(conciergeArray) {
        mutableListOf<Concierge>().apply {
            if (conciergeArray != null) {
                for (i in 0 until conciergeArray.length()) {
                    val item = conciergeArray.optJSONObject(i) ?: continue
                    val title = item.optString("title")
                    val description = item.optString("description")
                    val imageUrl = item.optJSONObject("headerImg")?.optString("url")
                    val actionsArray = item.optJSONArray("actions")

                    val actions = mutableListOf<ConciergeAction>()
                    if (actionsArray != null) {
                        for (j in 0 until actionsArray.length()) {
                            val actionObj = actionsArray.optJSONObject(j)
                            if (actionObj != null) {
                                actions.add(
                                    ConciergeAction(
                                        label = actionObj.optString("label")
                                    )
                                )
                            }
                        }
                    }

                    add(Concierge(title, description, imageUrl, actions))
                }
            }
        }
    }

    if (concierge.isEmpty()) {
        Column(Modifier.fillMaxSize()) { // Use a Column for the whole screen
            // Top Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 12.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
                Text(
                    text = "Concierge",
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            // Centered Content (Loading/Empty state)
            Box(
                modifier = Modifier.fillMaxSize(), // This Box will take the remaining space
                contentAlignment = Alignment.Center
            ) {
                Column( // This Column will center its children together
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp) // Adds space between text and button
                ) {
                    Text(
                        "Something seems to have gone wrong. Can you refresh the page please ?",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Button(
                        onClick = {
                            scope.launch {
                                PollingManager.getHotelInfoRepository().fetchHotelInfo()
                            }
                        },
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text("Refresh Page", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
        return
    }

    var selectedConcierge by remember { mutableStateOf(concierge.first()) }

    Column(Modifier.fillMaxSize()) {
        // Sticky Top bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 12.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackClick) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Concierge",
                fontWeight = FontWeight.Bold,
                fontSize = 22.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
        }

        // Main content: left menu + right detail
        Row(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surface)
        ) {
            // Left side menu
            LazyColumn(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(220.dp)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemsIndexed(concierge) { _, concierge ->
                    val isSelected = selectedConcierge == concierge
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(
                                if (isSelected) MaterialTheme.colorScheme.surfaceVariant
                                else Color.White
                            )
                            .clickable(
                                indication = null,
                                interactionSource = remember { MutableInteractionSource() }
                            ) { selectedConcierge = concierge }
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                    ) {
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = concierge.title,
                            fontWeight = if (isSelected)
                                FontWeight.Bold else FontWeight.Medium,
                            fontSize = 17.sp,
                            color = if (isSelected) MaterialTheme.colorScheme.primary
                            else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            // Right side details
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .weight(1f)
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp)
            ) {
                ConciergeDetail(
                    title = selectedConcierge.title,
                    description = selectedConcierge.description,
                    imageUrl = selectedConcierge.imageUrl,
                    actions = selectedConcierge.actions
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
    actions: List<ConciergeAction> = emptyList()
) {
    val annotatedDesc = parseConciergeDescription(description)
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    var loading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Text(
            text = title,
            fontWeight = FontWeight.Bold,
            fontSize = 20.sp
        )

        if (imageUrl != null) {
            AsyncImage(
                model = imageUrl,
                contentDescription = title,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(320.dp)
                    .clip(RoundedCornerShape(20.dp)),
                contentScale = ContentScale.Crop
            )
        }

        Text(
            text = annotatedDesc,
            style = MaterialTheme.typography.bodyLarge.copy(
                fontSize = 18.sp,
                lineHeight = 28.sp
            )
        )

        // Show actions dynamically
        if (actions.isNotEmpty()) {
            actions.forEach { action ->
                Button(
                    onClick = {
                        if (loading) return@Button

                        loading = true
                        scope.launch {
                            try {
                                val apiService = ApiService(context)
                                val requestBody = JSONObject().apply {
                                    put("department", DepartmentType.CONCIERGE.key)
                                    put("requestType", "Enquiry: ${title}")
                                    put("bookingId", SessionManager(context).getBookingId())
                                }

                                when (val result = apiService.post("requests", requestBody)) {
                                    is ApiResult.Success -> {
                                        Log.d("ConciergeBooking", "${title} booking requested")
                                        SnackbarManager.showMessage(
                                            "We will contact you soon with more info on ${title}",
                                            SnackbarType.SUCCESS
                                        )
                                        PollingManager.getBookingRepository().fetchBooking()
                                    }

                                    is ApiResult.Error -> {
                                        Log.d(
                                            "ConciergeBooking",
                                            "Failed to raise request book ${title} "
                                        )
                                        SnackbarManager.showMessage(
                                            "Something went wrong. Please try again later. Sorry :(",
                                            SnackbarType.ERROR
                                        )
                                    }
                                }
                            } finally {
                                loading = false 
                                PollingManager.getBookingRepository().fetchBooking()
                            }
                        }
                    },
                    shape = RoundedCornerShape(16.dp)
                ) {
                    if (loading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 3.dp
                        )
                    } else {
                        Text(action.label, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}


// Data model
data class Concierge(
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val actions: List<ConciergeAction> = emptyList()
)

data class ConciergeAction(
    val label: String
)

@Composable
fun parseConciergeDescription(desc: String): AnnotatedString {
    val builder = AnnotatedString.Builder()
    var cursor = 0
    val regex = Regex("<(Bold|Primary|Tertiary)>(.*?)</\\1>")

    regex.findAll(desc).forEach { match ->
        // Add text before match
        if (cursor < match.range.first) {
            builder.append(desc.substring(cursor, match.range.first))
        }

        val tag = match.groupValues[1]
        val content = match.groupValues[2]

        val style = when (tag) {
            "Bold" -> SpanStyle(fontWeight = FontWeight.Bold)
            "Primary" -> SpanStyle(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )

            "Tertiary" -> SpanStyle(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.tertiary
            )

            else -> SpanStyle()
        }

        builder.withStyle(style) { append(content) }

        cursor = match.range.last + 1
    }

    // Add remaining text
    if (cursor < desc.length) {
        builder.append(desc.substring(cursor))
    }

    return builder.toAnnotatedString()
}

