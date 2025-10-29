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
    private lateinit var hotelInfoRepo: HotelInfoRepository

    fun start(context: Context) {
        if (pollingScope != null) return

        apiService = ApiService(context)
        pollingScope = CoroutineScope(Dispatchers.IO + supervisorJob)

        bookingRepo = BookingRepository(apiService)
        restaurantMenuRepo = RestaurantMenuRepository(apiService)
        hotelInfoRepo = HotelInfoRepository(apiService)

        // Define intervals for each repository
        pollingScope?.launch {
            launch { startPollingBooking(bookingRepo.getPollingInterval()) }
            launch { startPollingRestaurantMenu(restaurantMenuRepo.getPollingInterval()) }
            launch { startPollingHotelInfo(hotelInfoRepo.getPollingInterval()) }
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

    private suspend fun startPollingHotelInfo(intervalMs: Long) = coroutineScope {
        while (isActive) {
            hotelInfoRepo.fetchHotelInfo()
            delay(intervalMs)
        }
    }

    // expose repositories to UI
    fun getBookingRepository() = bookingRepo
    fun getRestaurantMenuRepository() = restaurantMenuRepo
    fun getHotelInfoRepository() = hotelInfoRepo
}


class BookingRepository(private val apiService: ApiService) {
    private val _bookingData = MutableStateFlow<JSONObject?>(null)
    val bookingData = _bookingData.asStateFlow()

    suspend fun fetchBooking() {
        Log.d("PollingManager", "Calling /requests")
        when (val result = apiService.get("requests")) {
            is ApiResult.Success -> withContext(Dispatchers.Main) {
                _bookingData.value = result.data
                Log.d("PollingManager", "Booking fetch success: ${result.data}")
            }

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


class HotelInfoRepository(private val apiService: ApiService) {
    private val _hotelData = MutableStateFlow<JSONObject?>(null)
    val hotelData = _hotelData.asStateFlow()

    suspend fun fetchHotelInfo() {
        Log.d("PollingManager", "Calling /hotel/config")
        when (val result = apiService.get("hotel/config")) {
            is ApiResult.Success -> withContext(Dispatchers.Main) { _hotelData.value = result.data }
            is ApiResult.Error -> {
                Log.d("PollingManager", "Booking error: ${result.message}")
//                _hotelData.value = null;
            }
        }
    }

    fun getPollingInterval(): Long {
        return 60 * 60 * 1000L // 1 hr
    }
}


