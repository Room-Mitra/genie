import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import com.example.roommitra.service.ScreenDimService

@Composable
fun AutoDimWrapper(
    screenDimService: ScreenDimService?,
    content: @Composable () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures {
                    screenDimService?.resetAutoDimTimer()
                }
            }
    ) {
        content()
    }
}
