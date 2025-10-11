package com.example.roommitra.service

import android.content.Context
import android.provider.Settings
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.time.Instant

sealed class ApiResult {
    data class Success(val data: JSONObject?) : ApiResult()
    data class Error(val code: Int, val message: String? = null) : ApiResult()
}
class ApiService(private val context: Context) {
    companion object {
//        private const val BASE_URL = "http://192.168.29.120:3000/android"
        private const val BASE_URL = "https://api.roommitra.com/android"
    }
    // Get device ID dynamically
    private val deviceId: String
        get() = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)

    private val client = OkHttpClient()

    // Example: default headers
    private val defaultHeaders: Map<String, String>
        get() {
            val token = SessionManager(context).getAuthToken()

            val utcTimestamp = Instant.now().toEpochMilli().toString()
            return mapOf(
                "Content-Type" to "application/json",
                "x-device-id" to deviceId,
                "x-timestamp" to utcTimestamp

            ) + if (!token.isNullOrBlank()) {
                mapOf("authorization" to "Bearer $token")
            } else emptyMap()
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
        headers: Map<String, String>
    ): ApiResult = withContext(Dispatchers.IO) {
        try {
            val requestBuilder = Request.Builder()
                .url("$BASE_URL/$endpoint")

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

            return@withContext if (response.isSuccessful) {
                ApiResult.Success(if (!respBody.isNullOrEmpty()) JSONObject(respBody) else null)
            } else {
                Log.w("ApiService", "Error ${response.code}: $respBody")
                ApiResult.Error(response.code, respBody)
            }
        } catch (e: IOException) {
            Log.e("ApiService", "Network error during $method $endpoint", e)
            return@withContext ApiResult.Error(-1, e.message)
        }
    }
}