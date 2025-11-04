package com.example.roommitra.view

import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.net.*
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Build
import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import com.example.roommitra.service.SessionManager
import kotlinx.coroutines.*
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.InetAddress
import java.net.NetworkInterface
import java.net.URL
import java.util.*
import android.Manifest

import android.content.Intent
import android.content.IntentFilter
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import java.net.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(onBackClick: () -> Unit = {}) {
    var hotelId by remember { mutableStateOf("") }
    var roomId by remember { mutableStateOf("") }

    var isLoading by remember { mutableStateOf(false) }
    var loginMessage by remember { mutableStateOf<String?>(null) }
    var showDiagnostics by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()
    val scrollState = rememberScrollState()
    val context = LocalContext.current
    val sessionManager = remember { SessionManager(context) }
    val apiService = ApiService(context)

    fun onLogin(hotelId: String, roomId: String) {
        coroutineScope.launch {
            isLoading = true
            loginMessage = null
            val body = JSONObject().apply {
                put("hotelId", hotelId)
                put("roomId", roomId)
            }

            val result = apiService.post("login", body)
            isLoading = false
            loginMessage = when (result) {
                is ApiResult.Success -> {
                    val token = result.data?.optString("token")
                    val device = result.data?.optJSONObject("device")
                    val hId = device?.optString("hotelId")
                    val rId = device?.optString("roomId")
                    if (!token.isNullOrBlank()) {
                        sessionManager.saveSessionData(token, hId, rId)
                        "Login successful ✅ Click on back to start using the app!"
                    } else "Login successful, but no token returned"
                }

                is ApiResult.Error -> "Error ${result.code}: ${result.message}"
            }
        }
    }

    if (showDiagnostics) {
        DiagnosticsDialog(onClose = { showDiagnostics = false })
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .imePadding()
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { onBackClick() }) {
                    Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                }
                Text(
                    text = "Staff Login",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold, fontSize = 20.sp
                    ),
                    modifier = Modifier.padding(start = 8.dp)
                )
            }

            Spacer(modifier = Modifier.height(40.dp))

            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Room Mitra",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold, fontSize = 28.sp
                    )
                )

                Spacer(modifier = Modifier.height(40.dp))

                OutlinedTextField(
                    value = hotelId,
                    onValueChange = { hotelId = it },
                    label = { Text("Hotel ID") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(0.5f)
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = roomId,
                    onValueChange = { roomId = it },
                    label = { Text("Room ID") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(0.5f)
                )

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = {
                        if (hotelId.isNotBlank() && roomId.isNotBlank()) onLogin(hotelId, roomId)
                        else loginMessage = "Please fill in all fields."
                    },
                    enabled = !isLoading,
                    modifier = Modifier
                        .fillMaxWidth(0.5f)
                        .height(56.dp),
                    shape = MaterialTheme.shapes.extraLarge
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp,
                            modifier = Modifier.size(20.dp)
                        )
                    } else Text("Submit", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                }

                loginMessage?.let { msg ->
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = msg,
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (msg.startsWith("Error")) MaterialTheme.colorScheme.error
                        else MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        // 🩺 Floating Diagnostics Button (bottom right)
        Button(
            onClick = { showDiagnostics = true },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(bottom = 16.dp, end = 16.dp)
        ) {
            Text("Show Diagnostics")
        }
    }
}




@Composable
fun DiagnosticsDialog(onClose: () -> Unit) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var diagnostics by remember { mutableStateOf<Map<String, String?>>(emptyMap()) }
    var internetStatus by remember { mutableStateOf("Not checked") }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true &&
                permissions[Manifest.permission.ACCESS_WIFI_STATE] == true
        if (granted) diagnostics = getDiagnostics(context)
    }

    // Request both permissions
    LaunchedEffect(Unit) {
        val fineLocGranted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val wifiStateGranted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_WIFI_STATE
        ) == PackageManager.PERMISSION_GRANTED

        if (!fineLocGranted || !wifiStateGranted) {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_WIFI_STATE
                )
            )
        } else {
            diagnostics = getDiagnostics(context)
        }
    }

    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Device Diagnostics") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                diagnostics.forEach { (label, value) ->
                    Text("$label: ${value ?: "N/A"}", fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                }

                Spacer(modifier = Modifier.height(12.dp))
                Text("Internet Check: $internetStatus", fontSize = 14.sp)
                Spacer(modifier = Modifier.height(8.dp))

                Button(onClick = {
                    coroutineScope.launch {
                        internetStatus = "Checking..."
                        val connectivityOk = checkConnectivityManager(context)
                        val httpOk = checkInternetHttp()
                        withContext(Dispatchers.Main) {
                            internetStatus =
                                if (connectivityOk && httpOk) "Internet OK ✅"
                                else if (!connectivityOk && httpOk) "Limited Connectivity ⚠️"
                                else "No Internet ❌"
                        }
                    }
                }) {
                    Text("Check Internet")
                }
            }
        },
        confirmButton = { TextButton(onClick = onClose) { Text("Close") } }
    )
}

/** Collect all diagnostics safely **/
fun getDiagnostics(context: Context): Map<String, String?> {
    val hasWifiPermission =
        ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_WIFI_STATE) ==
                PackageManager.PERMISSION_GRANTED
    val hasLocationPermission =
        ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED

    val wifiManager =
        if (hasWifiPermission) context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        else null

    val info = try {
        if (hasWifiPermission) wifiManager?.connectionInfo else null
    } catch (e: SecurityException) {
        null
    }

    val batteryIntent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
    val batteryLevel = batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
    val chargingType = batteryIntent?.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1)
    val batteryStatus = when (chargingType) {
        BatteryManager.BATTERY_PLUGGED_AC -> "Charging (AC)"
        BatteryManager.BATTERY_PLUGGED_USB -> "Charging (USB)"
        BatteryManager.BATTERY_PLUGGED_WIRELESS -> "Charging (Wireless)"
        else -> "Not Charging"
    }

    // Try to get hardware MAC (may be masked)
    val macAddr = try {
        NetworkInterface.getNetworkInterfaces().toList()
            .firstOrNull { it.name.equals("wlan0", ignoreCase = true) }
            ?.hardwareAddress
            ?.joinToString(":") { String.format("%02X", it) }
    } catch (e: Exception) { null }

    val realMac = when {
        macAddr == null -> "Unavailable"
        macAddr == "02:00:00:00:00:00" -> "Masked by Android"
        else -> macAddr
    }

    val ssid = when {
        !hasLocationPermission -> "Location permission needed"
        info?.ssid.isNullOrBlank() -> "Not connected"
        else -> info?.ssid?.trim('"')
    }

    val bssid = when {
        !hasLocationPermission -> "Location permission needed"
        info?.bssid.isNullOrBlank() -> "Masked / Not available"
        else -> info?.bssid
    }

    return mapOf(
        "Wi-Fi SSID" to ssid,
        "BSSID" to bssid,
        "IP Address" to (info?.ipAddress?.let { intToIp(it) } ?: "N/A"),
        "Link Speed" to "${info?.linkSpeed ?: "?"} Mbps",
        "Signal Strength (RSSI)" to "${info?.rssi ?: "?"} dBm",
        "Randomized MAC (API)" to info?.macAddress,
        "Actual MAC (wlan0)" to realMac,
        "Battery Level" to "$batteryLevel%",
        "Battery Status" to batteryStatus,
        "Device" to "${Build.MANUFACTURER} ${Build.MODEL}",
        "Android Version" to Build.VERSION.RELEASE
    )
}

private fun intToIp(ip: Int): String =
    "${ip and 0xFF}.${ip shr 8 and 0xFF}.${ip shr 16 and 0xFF}.${ip shr 24 and 0xFF}"

suspend fun checkConnectivityManager(context: Context): Boolean = withContext(Dispatchers.IO) {
    try {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return@withContext false
        val caps = cm.getNetworkCapabilities(network)
        caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
    } catch (e: Exception) {
        false
    }
}

suspend fun checkInternetHttp(): Boolean = withContext(Dispatchers.IO) {
    try {
        val url = URL("https://clients3.google.com/generate_204")
        (url.openConnection() as HttpURLConnection).run {
            connectTimeout = 2000
            readTimeout = 2000
            connect()
            val ok = responseCode == 204
            disconnect()
            ok
        }
    } catch (e: Exception) {
        false
    }
}
