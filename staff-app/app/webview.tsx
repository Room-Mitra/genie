// webview.tsx

import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import * as Application from "expo-application";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../tasks/locationFetchTask"; // <-- CRITICAL import to register the task!
import * as Notifications from "expo-notifications";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { LOCATION_FETCH_TASK } from "../tasks/locationFetchTask";

const BASE_URL =
  Constants.expoConfig?.extra?.WEB_BACKEND_URL || `https://app.roommitra.com`;

const LOGIN_URL = `${BASE_URL}/login`;

const LOCATION_INTERVAL_SECONDS = 15 * 60; // 15 mins

export default function WebviewScreen() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // 1. Ask for notifications permission once
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  // 2. Load device info and persist
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

      setDeviceInfo(info);
      await AsyncStorage.setItem("rm_device", JSON.stringify(info));
    }

    loadDeviceInfo();
  }, []);

  // 3. Inject device info into WebView (for NextJS)
  const injectedJavaScript = deviceInfo
    ? `
      window.__MOBILE_CONTEXT__ = ${JSON.stringify(deviceInfo)};
      window.dispatchEvent(new Event("mobile-ready"));
      true;
    `
    : "";

  // 4. Register background fetch
  async function registerLocationFetch() {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      console.log("BackgroundFetch raw status:", status);

      if (status !== BackgroundFetch.BackgroundFetchStatus.Available) {
        console.log("Background fetch unavailable:", status);
        return;
      }

      const tasks = await TaskManager.getRegisteredTasksAsync();
      const exists = tasks.some((t) => t.taskName === LOCATION_FETCH_TASK);

      if (!exists) {
        await BackgroundFetch.registerTaskAsync(LOCATION_FETCH_TASK, {
          minimumInterval: LOCATION_INTERVAL_SECONDS,
          stopOnTerminate: false,
          startOnBoot: true,
        });

        console.log("BackgroundFetch task registered!");
      } else {
        console.log("BackgroundFetch task already registered");
      }
    } catch (e) {
      console.log("Failed to register BackgroundFetch:", e);
    }

    console.log(
      "Registered tasks:",
      await TaskManager.getRegisteredTasksAsync()
    );
  }

  // 5. Ensure permissions before enabling location-fetch
  async function enableLocationBackgroundFetch() {
    try {
      const fg = await Location.requestForegroundPermissionsAsync();
      console.log("Foreground location perm:", fg.status);
      if (fg.status !== "granted") return;

      const bg = await Location.requestBackgroundPermissionsAsync();
      console.log("Background location perm:", bg.status);
      if (bg.status !== "granted") return;

      await registerLocationFetch();
    } catch (err) {
      console.log("Failed enabling BackgroundFetch location:", err);
    }
  }

  const handleNavChange = (navState: any) => {

    const url = navState.url.toLowerCase();
    if (url === BASE_URL.toLowerCase() + "/") {
      console.log("User logged in inside WebView");
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      console.log("msg from app", data);

      if (data.type === "LOGIN_DATA") {
        console.log("Received LOGIN_DATA:", data.userId);

        await AsyncStorage.setItem("rm_user", JSON.stringify(data));

        console.log("Enabling BackgroundFetch after login...");
        await enableLocationBackgroundFetch();
      }
    } catch (err) {
      console.log("Failed to parse WebView message:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{
          uri: LOGIN_URL,
          headers: {
            "bypass-tunnel-reminder": "true",
            "User-Agent": "ExpoMobileApp",
          },
        }}
        onNavigationStateChange={handleNavChange}
        injectedJavaScript={injectedJavaScript}
        onLoadEnd={async () => {
          const existingUser = await AsyncStorage.getItem("rm_user");
          if (existingUser) {
            console.log("Existing rm_user found, ensuring BackgroundFetch setup");
            await enableLocationBackgroundFetch();
          }
        }}
        onMessage={handleMessage}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
