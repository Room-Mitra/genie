package com.example.roommitra.view

import java.util.UUID

enum class SnackbarType { SUCCESS, ERROR, INFO }

data class SnackbarMessage(
    val id: String = UUID.randomUUID().toString(),
    val message: String,
    val type: SnackbarType = SnackbarType.INFO
)
