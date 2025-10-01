package com.example.roommitra.view

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay

object SnackbarManager {
    private val _messages = MutableStateFlow<List<SnackbarMessage>>(emptyList())
    val messages = _messages.asStateFlow()

    fun showMessage(message: String, type: SnackbarType = SnackbarType.INFO) {
        val snackbar = SnackbarMessage(message = message, type = type)
        _messages.value = _messages.value + snackbar

        // Auto-dismiss after 5s
        kotlinx.coroutines.GlobalScope.launch {
            kotlinx.coroutines.delay(5000)
            dismiss(snackbar.id)
        }
    }

    fun dismiss(id: String) {
        _messages.value = _messages.value.filterNot { it.id == id }
    }

    fun clearAll() {
        _messages.value = emptyList()
    }
}
