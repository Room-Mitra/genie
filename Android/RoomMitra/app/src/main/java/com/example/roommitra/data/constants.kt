package com.example.roommitra.data


object Constants {
    const val STAGING_BASE_URL = "https://api-stage.roommitra.com/android"
    const val PROD_BASE_URL = "https://api.roommitra.com/android"

    //  Default URLs
    const val DEFAULT_BASE_URL = PROD_BASE_URL

    //  SharedPreferences Keys (only if you want to centralize them too)
    const val PREFS_NAME = "roommitra_prefs"

    //  Network timeouts
    const val NETWORK_TIMEOUT_SECONDS = 60L

}
