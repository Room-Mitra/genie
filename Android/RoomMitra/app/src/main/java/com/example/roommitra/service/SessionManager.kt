package com.example.roommitra.service

import android.content.Context

class SessionManager(context: Context) {
    private val prefs = context.getSharedPreferences("roommitra_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_HOTEL_ID = "hotel_id"
        private const val KEY_ROOM_ID = "room_id"
        private const val KEY_BOOKING_ID = "booking_id"
    }

    fun saveSessionData(token: String, hotelId: String?, roomId: String?) {
        prefs.edit()
            .putString(KEY_AUTH_TOKEN, token)
            .putString(KEY_HOTEL_ID, hotelId)
            .putString(KEY_ROOM_ID, roomId)
            .apply()
    }

    fun getAuthToken(): String? = prefs.getString(KEY_AUTH_TOKEN, null)
    fun getHotelId(): String? = prefs.getString(KEY_HOTEL_ID, null)
    fun getRoomId(): String? = prefs.getString(KEY_ROOM_ID, null)

    fun clearSession() {
        prefs.edit()
            .remove(KEY_AUTH_TOKEN)
            .remove(KEY_HOTEL_ID)
            .remove(KEY_ROOM_ID)
            .apply()
    }

    fun getBookingId(): String? = prefs.getString(KEY_BOOKING_ID, null)

    fun saveBookingId(bookingId: String) {
        prefs.edit()
            .putString(KEY_BOOKING_ID, bookingId)
            .apply()
    }

    fun clearBookingId() {
        prefs.edit()
            .remove(KEY_BOOKING_ID)
            .apply()
    }
}
