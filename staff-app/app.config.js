import 'dotenv/config';

export default ({ config }) => ({
  name: "Room Mitra Staff",
  slug: "staff-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "staffapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    bundleIdentifier: "com.roommitra.staffapp",
    supportsTablet: true,
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription: "We use your location for automatic on-duty detection.",
      NSLocationAlwaysUsageDescription: "We use your location even in background.",
      NSLocationWhenInUseUsageDescription: "We use your location when the app is open."
    }
  },

  android: {
    package: "com.roommitra.staffapp",
    label: "RoomMitra Staff",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/icon.png",
      backgroundImage: "./assets/images/icon.png",
      monochromeImage: "./assets/images/icon.png"
    },
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "FOREGROUND_SERVICE",
    ],
    "foregroundService": {
      "notificationTitle": "Room Mitra",
      "notificationBody": "Location tracking active"
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false
  },

  web: {
    output: "static",
    favicon: "./assets/images/favicon.png"
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: { backgroundColor: "#000000" }
      }
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: "Allow RoomMitra to access your location in background.",
        isAndroidForegroundServiceEnabled: true
      }
    ]
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true
  },

  extra: {
    WEB_BACKEND_URL: process.env.WEB_BACKEND_URL || "https://app.roommitra.com",
    API_BACKEND_URL: process.env.API_BACKEND_URL || "https://api.roommitra.com"
  }
});
