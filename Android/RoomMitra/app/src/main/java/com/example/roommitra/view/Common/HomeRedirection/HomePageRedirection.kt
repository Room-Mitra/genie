import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import com.example.roommitra.service.PollingManager
import com.example.roommitra.service.SessionManager

@Composable
fun HomePageRedirection(
    navController: NavHostController,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current

    val sessionManager = remember { SessionManager(context) }

    // Get repository and collect its state
    val bookingRepo = PollingManager.getBookingRepository()
    val bookingData by bookingRepo.bookingData.collectAsState()
    // React to state changes
    LaunchedEffect(bookingData) {
        val currentRoute = navController.currentBackStackEntry?.destination?.route
        val booking = bookingData?.optJSONObject("booking")
        if (booking == null) {
            sessionManager.clearBookingId()
            if (currentRoute != "no-active-booking") {
                navController.navigate("no-active-booking") {
                    popUpTo("home") { inclusive = true }
                }
            }
        } else {
            val bookingId = booking.optString("bookingId", null)
            if (bookingId != null) {
                sessionManager.saveBookingId(bookingId);
                if (currentRoute == "no-active-booking") {
                    navController.navigate("home") {
                        popUpTo("no-active-booking") { inclusive = true }
                    }
                }
            } else {
                sessionManager.clearBookingId()
                if (currentRoute != "no-active-booking") {
                    navController.navigate("no-active-booking") {
                        popUpTo("home") { inclusive = true }
                    }
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
    ) {
        content()
    }
}
