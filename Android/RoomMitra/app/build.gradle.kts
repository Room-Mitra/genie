plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.roommitra"
    compileSdk = 36 // use 34, as 36 is preview-only

    defaultConfig {
        applicationId = "com.example.roommitra"
        minSdk = 26
        targetSdk = 36

        versionCode = 29
        versionName = "1.0.29"


        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.9.0")

    // youtube
    implementation("com.pierfrancescosoffritti.androidyoutubeplayer:core:13.0.0")
    implementation("com.pierfrancescosoffritti.androidyoutubeplayer:custom-ui:13.0.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    implementation("com.squareup.moshi:moshi:1.15.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.0")
   
    // Jetpack Compose BOM (align versions automatically)
    implementation(platform("androidx.compose:compose-bom:2024.05.00"))
    // Jetpack Compose Navigation
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Compose UI + Material 3
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")

    // Material icons
    implementation("androidx.compose.material:material-icons-core")
    implementation("androidx.compose.material:material-icons-extended")
    implementation(libs.androidx.lifecycle.common.jvm)
    implementation(libs.androidx.animation.core)
    implementation(libs.androidx.ui.text)

    implementation(libs.androidx.animation)
    implementation(libs.material3)

    // Debug utilities
    debugImplementation("androidx.compose.ui:ui-tooling")
//    debugImplementation("androidx.compose.ui:test-manifest")

    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.okhttp3:okhttp:4.9.3")
    implementation("com.squareup.okio:okio:2.10.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    // ExoPlayer
    implementation("androidx.media3:media3-exoplayer:1.4.1")
    implementation("androidx.media3:media3-ui:1.4.1")

    // Unit testing
    testImplementation(libs.junit)

    // Android tests
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.05.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")


    // deals card - slideshow
    implementation("io.coil-kt:coil-compose:2.5.0")
    implementation("androidx.compose.foundation:foundation:1.6.2")

    //lottie
    implementation("com.airbnb.android:lottie-compose:6.3.0")

}
