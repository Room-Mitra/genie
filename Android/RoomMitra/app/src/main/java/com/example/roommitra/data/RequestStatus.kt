package com.example.roommitra.data

enum class RequestStatus(val key: String) {
    UNACKNOWLEDGED("unacknowledged"),
    IN_PROGRESS("in_progress"),
    DELAYED("delayed"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    companion object {
        fun fromKey(key: String): RequestStatus? {
            return entries.find { it.key == key }
        }
    }
}
