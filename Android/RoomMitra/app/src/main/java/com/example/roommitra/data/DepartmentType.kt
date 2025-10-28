package com.example.roommitra.data

enum class DepartmentType(val key: String) {
    HOUSEKEEPING("house_keeping"),
    ROOM_SERVICE("room_service"),
    FRONT_OFFICE("front_office"),
    CONCIERGE("concierge"),
    FACILITIES("facilities"),
    GENERAL_ENQUIRY("general_enquiry");

    companion object {
        fun fromKey(key: String): DepartmentType? {
            return entries.find { it.key == key }
        }
    }
}
