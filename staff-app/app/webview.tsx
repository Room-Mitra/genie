// webview.tsx

import React, { useEffect, useState } from "react";
import { StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import * as Application from "expo-application";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

// Must be imported BEFORE anything else runs
import "../tasks/locationTask";
import { LOCATION_TASK } from "../tasks/locationTask";

export default function WebviewScreen() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  const BASE_URL =
    Constants.expoConfig?.extra?.WEB_BACKEND_URL || `https://app.roommitra.com`;

  const LOGIN_URL = `${BASE_URL}/login`;

  // 🔹 Ask notification permission on startup
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  // 🔹 Load & save device info
  useEffect(() => {
    async function loadDeviceInfo() {
      const androidId =
        Platform.OS === "android" ? await Application.getAndroidId() : null;
      const iosId =
        Platform.OS === "ios"
          ? await Application.getIosIdForVendorAsync()
          : null;

      const info = {
        deviceId: androidId || iosId || "unknown-device",
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version ?? "unknown",
      };

      console.log("📱 Device Info:", info);

      setDeviceInfo(info);
      await AsyncStorage.setItem("rm_device", JSON.stringify(info));
    }

    loadDeviceInfo();
  }, []);

  // 🔹 Inject device context for webapp
  const injectedJavaScript = deviceInfo
    ? `
      window.__MOBILE_CONTEXT__ = ${JSON.stringify(deviceInfo)};
      window.dispatchEvent(new Event("mobile-ready"));
      true;
    `
    : "";

  // 🔹 Start background location service
  async function enableLocationTracking() {
    try {
      console.log("⚙️ Requesting location permissions...");

      const fg = await Location.requestForegroundPermissionsAsync();
      console.log("FG perm:", fg.status);

      if (fg.status !== "granted") {
        console.log(" Foreground permission denied");
        return;
      }

      const bg = await Location.requestBackgroundPermissionsAsync();
      console.log("BG perm:", bg.status);

      if (bg.status !== "granted") {
        console.log(" Background permission denied");
        return;
      }

      console.log(" Starting background location listener...");

      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 15 * 60 * 1000, // every 15 mins
        distanceInterval: 50,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Room Mitra",
          notificationBody: "Please update your status if you are on duty",
        },
        pausesUpdatesAutomatically: false, // keep running even if device idle
      });

      console.log(" Background location tracking active!");
    } catch (err) {
      console.log("Failed enabling background tracking:", err);
    }
  }

  // 🔹 Navigation listener
  const handleNavChange = (navState: any) => {
    const url = navState.url.toLowerCase();
    if (url.startsWith(BASE_URL.toLowerCase())) {
      console.log("➡ WebView navigation:", url);
    }
  };

  // 🔹 Web <-> Native handshake
  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(" msg from app:", data);

      if (data.type === "LOGIN_DATA") {
        console.log("LOGIN_DATA received:", data.userId);

        await AsyncStorage.setItem("rm_user", JSON.stringify(data));

        console.log(" Starting location tracking after login...");
        await enableLocationTracking();
      }
    } catch (err) {
      console.log(" Failed to parse message:", err);
    }
  };

  return (
    <WebView
      source={{
        uri: LOGIN_URL,
        headers: {
          "User-Agent": "ExpoMobileApp",
          "bypass-tunnel-reminder": "true",
        },
      }}
      injectedJavaScript={injectedJavaScript}
      onNavigationStateChange={handleNavChange}
      onMessage={handleMessage}
      onLoadEnd={async () => {
        const existingUser = await AsyncStorage.getItem("rm_user");
        if (existingUser) {
          console.log("Existing rm_user detected, enabling tracking...");
          await enableLocationTracking();
        }
      }}
      style={{ flex: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
