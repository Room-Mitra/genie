import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import com.example.roommitra.service.ScreenDimService
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.content.ComponentName
import android.os.IBinder
import android.util.Log
import android.view.Window
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext

@Composable
fun AutoDimWrapper(
    window: Window,
    content: @Composable () -> Unit
) {
    val screenDimService = rememberScreenDimService(window)

    // Reset timer whenever composable is shown
    LaunchedEffect(screenDimService) {
        screenDimService?.resetAutoDimTimer()
    }
    Box(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(screenDimService) {
                awaitPointerEventScope {
                    while (true) {
                        val event = awaitPointerEvent()
                        Log.d("AutoDimWrapper", "Interaction detected: $event")
                        screenDimService?.resetAutoDimTimer()
                    }
                }
            }
    ) {
        content()
    }
}

@Composable
fun rememberScreenDimService(window: Window): ScreenDimService? {
    val context = LocalContext.current
    var service by remember { mutableStateOf<ScreenDimService?>(null) }

    DisposableEffect(Unit) {
        val connection = object : ServiceConnection {
            override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
                val localBinder = binder as ScreenDimService.LocalBinder
                val s = localBinder.getService()
                s.attachWindow(window)
                service = s
            }

            override fun onServiceDisconnected(name: ComponentName?) {
                service = null
            }
        }

        val intent = Intent(context, ScreenDimService::class.java)
        context.bindService(intent, connection, Context.BIND_AUTO_CREATE)

        onDispose {
            context.unbindService(connection)
        }
    }

    return service
}

