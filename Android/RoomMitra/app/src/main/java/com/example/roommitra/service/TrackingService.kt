package com.example.roommitra.service

import android.content.Context
import android.provider.Settings
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.time.Instant
import java.util.UUID

class TrackingService private constructor(
    private val context: Context,
    private val apiService: ApiService
) {
    companion object {
        @Volatile
        private var INSTANCE: TrackingService? = null

        fun initialize(context: Context, apiService: ApiService) {
            if (INSTANCE == null) {
                synchronized(this) {
                    if (INSTANCE == null) {
                        INSTANCE = TrackingService(context.applicationContext, apiService)
                    }
                }
            }
        }

        fun getInstance(): TrackingService {
            return INSTANCE
                ?: throw IllegalStateException("TrackingService not initialized. Call initialize() first.")
        }
    }

    fun trackEvent(eventName: String, properties: Map<String, Any?> = emptyMap()) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val eventPayload = JSONObject().apply {
                    put("eventId", UUID.randomUUID().toString())
                    put("eventName", eventName)
                    put("timestamp", Instant.now().toEpochMilli())
                    put(
                        "deviceId",
                        Settings.Secure.getString(
                            context.contentResolver,
                            Settings.Secure.ANDROID_ID
                        )
                    )

                    val propsJson = JSONObject()
                    properties.forEach { (key, value) ->
                        propsJson.put(key, value ?: JSONObject.NULL)
                    }
                    put("properties", propsJson)
                }

                apiService.post("track-events", eventPayload) // fire-and-forget
                Log.d("TrackingService", "Dispatched event: $eventPayload")

            } catch (e: Exception) {
                Log.e("TrackingService", "Failed to track event", e)
            }
        }
    }
}
