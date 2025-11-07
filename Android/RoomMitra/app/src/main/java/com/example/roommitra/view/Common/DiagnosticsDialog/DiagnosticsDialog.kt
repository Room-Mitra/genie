package com.example.roommitra.view

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.NetworkInterface
import java.net.URL
import kotlin.collections.component1
import kotlin.collections.component2


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
