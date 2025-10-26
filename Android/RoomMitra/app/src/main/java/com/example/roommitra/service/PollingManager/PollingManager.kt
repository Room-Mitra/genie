package com.example.roommitra.service

import android.content.Context
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject
import com.example.roommitra.service.ApiService
import com.example.roommitra.service.ApiResult
import kotlinx.coroutines.flow.asStateFlow

object PollingManager {

    private val supervisorJob = SupervisorJob()
    private var pollingScope: CoroutineScope? = null

    private lateinit var bookingRepo: BookingRepository
    private lateinit var apiService: ApiService

    fun start(context: Context) {
        if (pollingScope != null) return

        apiService = ApiService(context)
        pollingScope = CoroutineScope(Dispatchers.IO + supervisorJob)

        bookingRepo = BookingRepository(apiService)

        // Define intervals for each repository
        pollingScope?.launch {
            startPollingBooking(bookingRepo.getPollingInterval())
        }
    }



    fun stop() {
        pollingScope?.cancel()
        pollingScope = null
    }

    private suspend fun startPollingBooking(intervalMs: Long) = coroutineScope {
        while (isActive) {
            bookingRepo.fetchBooking()
            delay(intervalMs)
        }
    }

    // expose repositories to UI
    fun getBookingRepository() = bookingRepo
}



class BookingRepository(private val apiService: ApiService) {

    private val _bookingData = MutableStateFlow<JSONObject?>(null)
    val bookingData = _bookingData.asStateFlow()

    suspend fun fetchBooking() {
        when (val result = apiService.get("requests")) {
            is ApiResult.Success -> _bookingData.value = result.data
            is ApiResult.Error -> {
                Log.d("PollingManager", "Booking error: ${result.message}")
                _bookingData.value = null;
            }
        }
    }

    fun getPollingInterval(): Long {
        return 2 * 60 * 1000L // 2mins
    }
}

