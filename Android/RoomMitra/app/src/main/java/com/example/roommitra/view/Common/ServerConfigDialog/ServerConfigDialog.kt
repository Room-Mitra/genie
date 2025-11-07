package com.example.roommitra.view

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.roommitra.data.Constants
import com.example.roommitra.service.ApiResult
import com.example.roommitra.service.ApiService
import com.example.roommitra.service.SessionManager
import kotlinx.coroutines.launch

@Composable
fun ServerConfigDialog(
    onClose: () -> Unit,
    sessionManager: SessionManager,
    apiService: ApiService
) {
    val currentBaseUrl = sessionManager.getBaseUrl()
    var selectedEnv by remember {
        mutableStateOf(
            when {
                currentBaseUrl == Constants.PROD_BASE_URL -> "Prod"
                currentBaseUrl == Constants.STAGING_BASE_URL -> "Stage"
                else -> "Tunnel"
            }
        )
    }
    var tunnelUrl by remember { mutableStateOf(if (selectedEnv == "Tunnel") currentBaseUrl else "") }
    var healthStatus by remember { mutableStateOf<String?>(null) }
    var checkingHealth by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()

    fun performHealthCheck() {
        coroutineScope.launch {
            checkingHealth = true
            healthStatus = null
            val result = apiService.get("health")
            checkingHealth = false
            healthStatus = when (result) {
                is ApiResult.Success -> "✅ Server is healthy. URL  = ${sessionManager.getBaseUrl()}"
                is ApiResult.Error -> "❌ Server error: ${result.message ?: result.code}\nURL  = ${sessionManager.getBaseUrl()}"
            }
        }
    }

    fun saveSelection() {
        when (selectedEnv) {
            "Prod" -> sessionManager.setBaseUrl(Constants.PROD_BASE_URL)
            "Stage" -> sessionManager.setBaseUrl(Constants.STAGING_BASE_URL)
            "Tunnel" -> {
                if (tunnelUrl.isNotBlank()) {
                    sessionManager.setBaseUrl(tunnelUrl)
                }
            }
        }

    }

    fun saveSelectionAndClose() {
        saveSelection()
        onClose()
    }



    AlertDialog(
        onDismissRequest = onClose,
        confirmButton = {
            TextButton(onClick = { saveSelectionAndClose() }) { Text("Save") }
        },
        dismissButton = {
            TextButton(onClick = onClose) { Text("Cancel") }
        },
        title = { Text("Server Configuration") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Select Environment:")
                DropdownMenuBox(
                    selectedEnv = selectedEnv,
                    onEnvSelected = { selectedEnv = it;saveSelection() }
                )

                if (selectedEnv == "Tunnel") {
                    OutlinedTextField(
                        value = tunnelUrl,
                        onValueChange = { tunnelUrl = it },
                        label = { Text("Tunnel URL") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                Divider(modifier = Modifier.padding(vertical = 8.dp))

                Button(
                    onClick = { performHealthCheck() },
                    enabled = !checkingHealth,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (checkingHealth) {
                        CircularProgressIndicator(
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp,
                            modifier = Modifier.size(20.dp)
                        )
                    } else Text("Check Server Health")
                }

                healthStatus?.let {
                    Text(
                        text = it,
                        color = if (it.contains("✅")) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    )
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DropdownMenuBox(
    selectedEnv: String,
    onEnvSelected: (String) -> Unit
) {
    val options = listOf("Prod", "Stage", "Tunnel")
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded }
    ) {
        OutlinedTextField(
            value = selectedEnv,
            onValueChange = {},
            readOnly = true,
            label = { Text("Environment") },
            modifier = Modifier
                .menuAnchor() 
                .fillMaxWidth()
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option) },
                    onClick = {
                        onEnvSelected(option)
                        expanded = false
                    }
                )
            }
        }
    }
}
