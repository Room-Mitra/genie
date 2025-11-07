package com.example.roommitra.service

import android.content.Context
import android.provider.Settings
import android.util.Log
import com.example.roommitra.data.Constants
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.time.Instant
import java.util.concurrent.TimeUnit

sealed class ApiResult {
    data class Success(val data: JSONObject?) : ApiResult()
    data class Error(val code: Int, val message: String? = null) : ApiResult()
}
class ApiService(private val context: Context) {
//    private val sessionManager = SessionManager(context)
//    companion object {
////        private const val BASE_URL = "https://major-candles-arrive.loca.lt"+"/android"
//        private const val BASE_URL = "https://api.roommitra.com/android"
////        private const val BASE_URL = "https://api-stage.roommitra.com"
//    }

    private val client = OkHttpClient.Builder()
        .connectTimeout(Constants.NETWORK_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .readTimeout(Constants.NETWORK_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .writeTimeout(Constants.NETWORK_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .build()

    // Example: default headers
    private val defaultHeaders: Map<String, String>
        get() {
            val token = SessionManager(context).getAuthToken()
            val hotelId = SessionManager(context).getHotelId()
            val roomId = SessionManager(context).getRoomId()
            val bookingId = SessionManager(context).getBookingId()
            val guestId = SessionManager(context).getGuestId()
            val deviceId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) // Get device ID dynamically

            val utcTimestamp = Instant.now().toEpochMilli().toString()
            val headers = mutableMapOf(
                "Content-Type" to "application/json",
                "x-device-id" to deviceId,
                "x-timestamp" to utcTimestamp
            )

            // Conditionally add token and related IDs
            if (!token.isNullOrBlank()) {
                headers += mapOf(
                    "authorization" to "Bearer $token",
                    "x-hotel-id" to hotelId.toString(),
                    "x-room-id" to roomId.toString()
                )
            }

            if (bookingId != null) {
                headers["x-booking-id"] = bookingId
            }
            if (guestId != null) {
                headers["x-guest-user-id"] = guestId
            }

            return headers
        }


    // GET request
    suspend fun get(endpoint: String, headers: Map<String, String> = emptyMap()): ApiResult =
        request("GET", endpoint, null, headers)

    // POST request
    suspend fun post(endpoint: String, body: JSONObject, headers: Map<String, String> = emptyMap()): ApiResult =
        request("POST", endpoint, body, headers)

    // PUT request
    suspend fun put(endpoint: String, body: JSONObject, headers: Map<String, String> = emptyMap()): ApiResult =
        request("PUT", endpoint, body, headers)

    // DELETE request
    suspend fun delete(endpoint: String, headers: Map<String, String> = emptyMap()): ApiResult =
        request("DELETE", endpoint, null, headers)

    private suspend fun request(
        method: String,
        endpoint: String,
        body: JSONObject? = null,
        headers: Map<String, String>,
        maxRetries: Int = 3,                 // configurable retries
        retryDelayMillis: Long = 2000L       // 2 seconds initial delay
    ): ApiResult = withContext(Dispatchers.IO) {
        var attempt = 0
        var currentDelay = retryDelayMillis

        var baseUrl = SessionManager(context).getBaseUrl()
        if (baseUrl.isBlank()) {
            Log.e("ApiService", "BASE_URL is empty. Using default production URL.")
            baseUrl = Constants.DEFAULT_BASE_URL
        }

        while (attempt < maxRetries) {
            try {
                val requestBuilder = Request.Builder()
                    .url("$baseUrl/$endpoint")

                // Merge default + custom headers
                (defaultHeaders + headers).forEach { (key, value) ->
                    requestBuilder.addHeader(key, value)
                }

                if (body != null) {
                    val requestBody = body.toString()
                        .toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())
                    requestBuilder.method(method, requestBody)
                } else {
                    requestBuilder.method(method, null)
                }

                val response = client.newCall(requestBuilder.build()).execute()
                val respBody = response.body?.string()

                if (response.isSuccessful) {
                    Log.i("ApiService", "API Success ${response.code}: $respBody")
                    return@withContext ApiResult.Success(
                        if (!respBody.isNullOrEmpty()) JSONObject(respBody) else null
                    )
                } else {
                    Log.w("ApiService", "Error ${response.code}: $respBody")
                    // Retry only for server errors (5xx)
                    if (response.code in 500..599 && attempt < maxRetries - 1) {
                        delay(currentDelay)
                        currentDelay *= 2 // exponential backoff
                        attempt++
                        continue
                    }
                    return@withContext ApiResult.Error(response.code, respBody)
                }

            } catch (e: IOException) {
                Log.e("ApiService", "Network error during $method $endpoint (attempt ${attempt + 1})", e)
                if (attempt < maxRetries - 1) {
                    delay(currentDelay)
                    currentDelay *= 2 // exponential backoff
                    attempt++
                } else {
                    return@withContext ApiResult.Error(-1, e.message)
                }
            }
        }

        return@withContext ApiResult.Error(-1, "Max retry attempts reached")
    }

}