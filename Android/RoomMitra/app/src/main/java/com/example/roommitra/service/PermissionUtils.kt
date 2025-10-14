package com.example.roommitra.service

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.core.content.ContextCompat

/**
 * Handles microphone record permission (RECORD_AUDIO) in a composable-friendly way.
 *
 * @return a Pair:
 *   - hasPermission: MutableState<Boolean> indicating if permission is granted
 *   - requestPermission: lambda to trigger permission request
 */
@Composable
fun rememberRecordAudioPermission(
    onPermissionGranted: (() -> Unit)? = null
): Pair<MutableState<Boolean>, () -> Unit> {
    val context = androidx.compose.ui.platform.LocalContext.current

    // Track permission state
    val hasPermission = remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                    PackageManager.PERMISSION_GRANTED
        )
    }

    // Launcher to request permission
    val permissionLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            hasPermission.value = granted
            if (granted) onPermissionGranted?.invoke()
        }

    // Return both permission state and launcher trigger
    return hasPermission to { permissionLauncher.launch(Manifest.permission.RECORD_AUDIO) }
}
