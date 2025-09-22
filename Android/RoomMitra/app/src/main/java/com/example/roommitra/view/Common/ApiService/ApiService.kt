package com.example.roommitra.service

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import android.provider.Settings
import android.content.Context
class ApiService(private val context: Context) {
    companion object {
        private const val BASE_URL = "http://192.168.29.120:3000"
    }
    // Get device ID dynamically
    private val deviceId: String
        get() = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)

    private val client = OkHttpClient()

    // Example: default headers
    private val defaultHeaders: Map<String, String>
        get() = mapOf(
            "authorization" to "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaG90ZWxJZCI6IlJvb20gR2VuaWUiLCJpYXQiOjE3NTYyNzEzMDEsImV4cCI6MTc1NzEzNTMwMX0.k1G6tUeL_Q_mDND5Vsa657HqGKXJEQEvbWb0o--dPMI",
            "Content-Type" to "application/json",
            "X-Device-ID" to deviceId
        )

    // GET request
    suspend fun get(endpoint: String, headers: Map<String, String> = emptyMap()): JSONObject? =
        request("GET", endpoint, null, headers)

    // POST request
    suspend fun post(endpoint: String, body: JSONObject, headers: Map<String, String> = emptyMap()): JSONObject? =
        request("POST", endpoint, body, headers)

    // PUT request
    suspend fun put(endpoint: String, body: JSONObject, headers: Map<String, String> = emptyMap()): JSONObject? =
        request("PUT", endpoint, body, headers)

    // DELETE request
    suspend fun delete(endpoint: String, headers: Map<String, String> = emptyMap()): JSONObject? =
        request("DELETE", endpoint, null, headers)

    private suspend fun request(
        method: String,
        endpoint: String,
        body: JSONObject? = null,
        headers: Map<String, String>
    ): JSONObject? = withContext(Dispatchers.IO) {
        try {
            val requestBuilder = Request.Builder()
                .url("$BASE_URL/$endpoint")

            // Merge default headers + call-specific headers
            (defaultHeaders + headers).forEach { (key, value) ->
                requestBuilder.addHeader(key, value)
            }

            if (body != null) {
                val requestBody = body.toString().toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())
                requestBuilder.method(method, requestBody)
            } else {
                requestBuilder.method(method, null)
            }

            val response = client.newCall(requestBuilder.build()).execute()
            val respBody = response.body?.string()
            Log.d("ApiService", "$method $endpoint → $respBody")
            return@withContext if (!respBody.isNullOrEmpty()) JSONObject(respBody) else null
        } catch (e: IOException) {
            Log.e("ApiService", "Error during $method $endpoint", e)
            return@withContext null
        }
    }
}
