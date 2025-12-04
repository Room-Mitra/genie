// app/(whatever)/webview.tsx

import React, { useEffect, useState } from "react";
import { StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import * as Application from "expo-application";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

// Ensure tasks are registered at app startup
import "../tasks/locationTask";
import { LOCATION_TASK } from "../tasks/locationTask";

import "../tasks/periodicLocationPingTask";
import { PERIODIC_PING_TASK } from "../tasks/periodicLocationPingTask";

const BASE_URL =
  Constants.expoConfig?.extra?.WEB_BACKEND_URL || "https://app.roommitra.com";

const LOGIN_URL = `${BASE_URL}/login`;

// 15 minutes in seconds (BackgroundFetch) / milliseconds (Location)
const LOCATION_UPDATE_INTERVAL_MS = 15 * 60 * 1000;
const PERIODIC_PING_INTERVAL_SECONDS = 15 * 60;

export default function WebviewScreen() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // 🔹 Ask notification permission on startup
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          const res = await Notifications.requestPermissionsAsync();
          console.log("Notification permission result:", res.status);
        } else {
          console.log(" Notification permission already granted");
        }
      } catch (err) {
        console.log(" Notification permission error:", err);
      }
    })();
  }, []);

  // 🔹 Load & cache device info (one-time per version)
  useEffect(() => {
    async function ensureDeviceInfo() {
      try {
        const existing = await AsyncStorage.getItem("rm_device");
        const currentVersion = Constants.expoConfig?.version;

        if (existing) {
          const parsed = JSON.parse(existing);
          if (parsed?.appVersion === currentVersion) {
            console.log("Using existing device info");
            setDeviceInfo(parsed);
            return;
          }
        }

        console.log(" Capturing device info for this install");

        const androidId =
          Platform.OS === "android" ? await Application.getAndroidId() : null;

        const iosId =
          Platform.OS === "ios"
            ? await Application.getIosIdForVendorAsync()
            : null;

        const info = {
          deviceId: androidId || iosId || "unknown-device",
          platform: Platform.OS,
          appVersion: currentVersion ?? "unknown",
          capturedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem("rm_device", JSON.stringify(info));
        setDeviceInfo(info);

        console.log(" Device Info:", info);
      } catch (err) {
        console.log("Failed to load device info:", err);
      }
    }

    ensureDeviceInfo();
  }, []);

  // 🔹 Inject device context into the web app
  const injectedJavaScript = deviceInfo
    ? `
      (function() {
        try {
          window.__MOBILE_CONTEXT__ = ${JSON.stringify(deviceInfo)};
          window.dispatchEvent(new Event("mobile-ready"));
        } catch (e) {
          console.log("Failed to set MOBILE_CONTEXT", e);
        }
      })();
      true;
    `
    : "";

  // 🔹 Start background location service (movement-based)
  async function enableLocationTracking() {
    try {
      console.log("⚙️ Requesting location permissions...");

      const fg = await Location.requestForegroundPermissionsAsync();
      console.log(" FG permission:", fg.status);
      if (fg.status !== "granted") {
        console.log("Foreground permission denied");
        return;
      }

      const bg = await Location.requestBackgroundPermissionsAsync();
      console.log(" BG permission:", bg.status);
      if (bg.status !== "granted") {
        console.log("Background permission denied");
        return;
      }

      console.log("Starting background location listener...");

      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: LOCATION_UPDATE_INTERVAL_MS,
        distanceInterval: 50, // meters
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Room Mitra",
          notificationBody: "Remember to update your duty status",
        },
        pausesUpdatesAutomatically: false,
      });

      console.log(" Background location tracking active");
    } catch (err) {
      console.log("Failed enabling background tracking:", err);
    }
  }

  // 🔹 Register periodic background fetch (timer-based)
  async function enablePeriodicPing() {
    try {
      console.log("Registering periodic ping task...");

      const status = await BackgroundFetch.getStatusAsync();
      console.log("BackgroundFetch status:", status);

      if (status !== BackgroundFetch.BackgroundFetchStatus.Available) {
        console.log("Background fetch unavailable, skipping");
        return;
      }

      const tasks = await TaskManager.getRegisteredTasksAsync();
      const exists = tasks.some(
        (t) => t.taskName === PERIODIC_PING_TASK,
      );

      if (!exists) {
        await BackgroundFetch.registerTaskAsync(PERIODIC_PING_TASK, {
          minimumInterval: PERIODIC_PING_INTERVAL_SECONDS,
          stopOnTerminate: false,
          startOnBoot: true,
        });

        console.log("Periodic ping registered");
      } else {
        console.log("ℹPeriodic ping task already registered");
      }
    } catch (err) {
      console.log("Failed to register periodic ping:", err);
    }
  }

  // 🔹 Navigation logger (optional)
  const handleNavChange = (navState: any) => {
    const url = navState.url.toLowerCase();
    if (url.startsWith(BASE_URL.toLowerCase())) {
      console.log("WebView navigation:", url);
    }
  };

  // 🔹 Web <-> Native: receive LOGIN_DATA from Next.js
  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("msg from web app:", data);

      if (data.type === "LOGIN_DATA") {
        console.log("LOGIN_DATA received:", data.userId);

        await AsyncStorage.setItem("rm_user", JSON.stringify(data));

        console.log("Enabling tracking after login...");
        await enableLocationTracking();  // movement-based
        await enablePeriodicPing();      // timed ping
      }
    } catch (err) {
      console.log("Failed to parse WebView message:", err);
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
        // If user already logged in (rm_user exists), re-enable tracking
        const existingUser = await AsyncStorage.getItem("rm_user");
        if (existingUser) {
          console.log("Existing rm_user detected, ensuring tracking...");
          await enableLocationTracking();
          await enablePeriodicPing();
        }
      }}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
