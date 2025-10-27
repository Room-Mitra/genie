package com.example.roommitra.service

import android.content.Context
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject

object PollingManager {

    private val supervisorJob = SupervisorJob()
    private var pollingScope: CoroutineScope? = null
    private lateinit var apiService: ApiService

    private lateinit var bookingRepo: BookingRepository
    private lateinit var restaurantMenuRepo: RestaurantMenuRepository

    fun start(context: Context) {
        if (pollingScope != null) return

        apiService = ApiService(context)
        pollingScope = CoroutineScope(Dispatchers.IO + supervisorJob)

        bookingRepo = BookingRepository(apiService)
        restaurantMenuRepo = RestaurantMenuRepository(apiService)

        // Define intervals for each repository
        pollingScope?.launch {
            launch { startPollingBooking(bookingRepo.getPollingInterval()) }
            launch { startPollingRestaurantMenu(restaurantMenuRepo.getPollingInterval()) }
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
    private suspend fun startPollingRestaurantMenu(intervalMs: Long) = coroutineScope {
        while (isActive) {
            restaurantMenuRepo.fetchMenu()
            delay(intervalMs)
        }
    }

    // expose repositories to UI
    fun getBookingRepository() = bookingRepo
    fun getRestaurantMenuRepository() = restaurantMenuRepo
}



class BookingRepository(private val apiService: ApiService) {
    private val _bookingData = MutableStateFlow<JSONObject?>(null)
    val bookingData = _bookingData.asStateFlow()

    suspend fun fetchBooking() {
        Log.d("PollingManager", "Calling /requests")
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


class RestaurantMenuRepository(private val apiService: ApiService) {
    private val _menuData = MutableStateFlow<JSONObject?>(null)
    val menuData = _menuData.asStateFlow()

    suspend fun fetchMenu() {
        Log.d("PollingManager", "Calling /restaurant/menu")
        when (val result = apiService.get("restaurant/menu")) {
            is ApiResult.Success -> {
                Log.d("PollingManager", "Menu fetch success: ${result.data}")
                withContext(Dispatchers.Main) {
                    _menuData.value = result.data
                }
            }
            is ApiResult.Error -> {
                Log.d("PollingManager", "Restaurant Menu error: ${result.message}")
//                _menuData.value = null
            }
        }
    }

    fun getPollingInterval(): Long {
        return 60 * 60 * 1000L // 1 hr
    }
}

