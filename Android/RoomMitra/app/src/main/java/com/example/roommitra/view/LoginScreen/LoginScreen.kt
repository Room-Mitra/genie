package com.example.roommitra.view

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
import org.json.JSONObject
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onBackClick: () -> Unit = {},
) {
    var hotelId by remember { mutableStateOf("") }
    var roomId by remember { mutableStateOf("") }
//    var password by remember { mutableStateOf("") }

//    var passwordVisible by remember { mutableStateOf(false) }


    var isLoading by remember { mutableStateOf(false) }
    var loginMessage by remember { mutableStateOf<String?>(null) }

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
                    "Login successful: ${result.data}"
                    val token = result.data?.optString("token")
                    if (!token.isNullOrBlank()) {
                        sessionManager.saveAuthToken(token)
                        "Login successful ✅ Click on the back button to start using the app!"
                    } else {
                        "Login successful, but no token returned"
                    }
                }
                is ApiResult.Error -> {
                    "Error ${result.code}: ${result.message}"
                }
            }
        }
    }


    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(scrollState)
            .imePadding()
    ) {
        // Top bar replacement
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { onBackClick() }) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back"
                )
            }
            Text(
                text = "Staff Login",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 20.sp
                ),
                modifier = Modifier.padding(start = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(40.dp))

        // Main content centered
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Room Mitra",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 28.sp
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

            Spacer(modifier = Modifier.height(16.dp))

//            OutlinedTextField(
//                value = password,
//                onValueChange = { password = it },
//                label = { Text("Password") },
//                singleLine = true,
//                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
//                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
//                modifier = Modifier.fillMaxWidth(0.5f),
//                trailingIcon = {
//                    val image = if (passwordVisible) {
//                        Icons.Filled.Visibility
//                    } else {
//                        Icons.Filled.VisibilityOff
//                    }
//
//                    val description = if (passwordVisible) "Hide password" else "Show password"
//
//                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
//                        Icon(imageVector = image, contentDescription = description)
//                    }
//                }
//            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = {
                    if (hotelId.isNotBlank() && roomId.isNotBlank()) {
                        onLogin(hotelId, roomId)
                    } else {
                        loginMessage = "Please fill in all fields."
                    }
                },
                enabled = !isLoading,
                modifier = Modifier.fillMaxWidth(0.5f)
                    .height(56.dp),
                shape = MaterialTheme.shapes.extraLarge,
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = 6.dp
                )
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp,
                        modifier = Modifier.size(20.dp)
                    )
                } else {
                    Text("Submit", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                }
            }
            loginMessage?.let { msg ->
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = msg,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (msg.startsWith("Error")) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}
