import android.util.Log
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.roommitra.view.DateTimePickerDialog
import java.time.LocalDateTime
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import com.example.roommitra.view.SnackbarManager
import com.example.roommitra.view.SnackbarType
import kotlinx.coroutines.launch
import org.json.JSONObject
import kotlin.collections.component1
import kotlin.collections.component2

@Composable
fun AmenityDetail(
    title: String,
    description: String,
    imageUrl: String? = null,
    isRegistrationNeeded: Boolean = false
) {
    var showDialog by remember { mutableStateOf(false) }
    var bookingDateTime by remember { mutableStateOf<LocalDateTime?>(null) }


    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Text(
            text = title,
            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
            fontSize = 17.sp,
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

        // Parse custom tags in description
        val annotatedDesc = parseDescription(description)

        Text(
            text = annotatedDesc,
            style = MaterialTheme.typography.bodyLarge.copy(
                fontSize = 18.sp,
                lineHeight = 28.sp
            )
        )

        if (isRegistrationNeeded) {
            Button(
                onClick = { showDialog = true  },
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Reserve Now", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
            if (showDialog) {
                DateTimePickerDialog(
                    onDismiss = { showDialog = false },
                    onConfirm = { selected ->
                        bookingDateTime = selected
                        showDialog = false
                        Log.d("AmenityBooking", "Trying to book ${title} for ${bookingDateTime}")
                        coroutineScope.launch {
                            val apiService = ApiService(context)

                            // amenity data
                            val amenityData = JSONObject().apply {
                                put("bookingDateTime", bookingDateTime.toString())
                                put("amenityType", title)
                            }

                            // Final request body
                            val requestBody = JSONObject().apply {
                                put("department", "FrontDesk")
                                put("totalAmount", 0)
                                put("data", amenityData)
                            }

                            when (val result = apiService.post("request", requestBody)) {
                                is ApiResult.Success -> {
                                    Log.d("AmenityBooking", "${title} booked for ${bookingDateTime}")
                                    SnackbarManager.showMessage("${title} booked for ${bookingDateTime!!.toLocalDate()} at ${bookingDateTime!!.toLocalTime()}", SnackbarType.SUCCESS)
                                }
                                is ApiResult.Error -> {
                                    Log.d("AmenityBooking", "Failed to book ${title} for ${bookingDateTime}")
                                    SnackbarManager.showMessage("Failed to book ${title} for ${bookingDateTime!!.toLocalDate()} at ${bookingDateTime!!.toLocalTime()}. Please try again after some time.", SnackbarType.ERROR)
                                }
                            }
                        }
                    }
                )
            }
        }
    }
}
