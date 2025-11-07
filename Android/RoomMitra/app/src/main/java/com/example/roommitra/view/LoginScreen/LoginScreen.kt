package com.example.roommitra.view

import android.net.*
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
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import com.example.roommitra.service.SessionManager
import kotlinx.coroutines.*
import org.json.JSONObject
import java.util.*
import java.net.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(onBackClick: () -> Unit = {}) {
    var hotelId by remember { mutableStateOf("") }
    var roomId by remember { mutableStateOf("") }

    var isLoading by remember { mutableStateOf(false) }
    var loginMessage by remember { mutableStateOf<String?>(null) }
    var showDiagnostics by remember { mutableStateOf(false) }
    var showServerConfig by remember { mutableStateOf(false) }

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
    if (showServerConfig) {
        ServerConfigDialog(
            onClose = { showServerConfig = false },
            sessionManager = sessionManager,
            apiService = apiService
        )
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


        Row(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(bottom = 16.dp, end = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(onClick = { showServerConfig = true }) {
                Text("Server Config")
            }
            Button(onClick = { showDiagnostics = true }) {
                Text("Show Diagnostics")
            }
        }
    }
}


