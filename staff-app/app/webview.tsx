import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import * as Application from "expo-application";
import * as Location from "expo-location";
import { GEOFENCE_TASK } from "../tasks/geoTask";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';


const BASE_URL = Constants.expoConfig?.extra?.WEB_BACKEND_URL || `https://app.roommitra.com`;
const LOGIN_URL = `${BASE_URL}/login`;

export default function WebviewScreen() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);


  useEffect(() => {
    async function registerNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log("Notification permission not granted");
      }
    }
    registerNotifications();
  }, []);

  // 1. Load device information asynchronously
  useEffect(() => {
    async function loadDeviceInfo() {
      const androidId = Platform.OS === "android"
        ? await Application.getAndroidId()
        : null;

      const iosId = Platform.OS === "ios"
        ? await Application.getIosIdForVendorAsync()
        : null;

      setDeviceInfo({
        deviceId: androidId || iosId || "unknown-device",
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version ?? "unknown",
      });
    }



    loadDeviceInfo();
  }, []);

  const [isLoggedIn, setLoggedIn] = useState(false);

  // 2. Prepare injected JavaScript AFTER device info is available
  const injectedJavaScript = deviceInfo
    ? `
      window.__MOBILE_CONTEXT__ = ${JSON.stringify(deviceInfo)};
      window.dispatchEvent(new Event("mobile-ready"));
      true;
    `
    : "";

  const handleNavChange = (navState: any) => {
    const url = navState.url.toLowerCase();
    if (url === BASE_URL.toLowerCase()) {
      setLoggedIn(true);
      console.log("User logged in inside WebView");
    }
  };

  async function initGeofence() {
    // await Notifications.scheduleNotificationAsync({
    //   content: { title: "Test", body: "Foreground OK?" },
    //   trigger: null,
    // });

    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log("status", status)
    if (status !== "granted") return;

    const bg = await Location.requestBackgroundPermissionsAsync();
    console.log("bg.status", bg.status)

    if (bg.status !== "granted") return;


    // STOP EXISTING GEOFENCE IF ANY (CRITICAL FIX)
    const tasks = await TaskManager.getRegisteredTasksAsync();
    const exists = tasks.some(t => t.taskName === GEOFENCE_TASK);

    if (exists) {
      console.log("Stopping existing geofence task...");
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
    }

    console.log("Starting geofence fresh...");
    const loc = await Location.getLastKnownPositionAsync({});
    console.log("PHONE LOCATION:", loc?.coords);

    // HOTEL COORDINATES (replace these)
    //seg :: 13.027015718666998, 77.75148457005004
    const HOTEL_LAT = 13.0273977; // TODO :: fetch from server 13.027030955745223, 77.75154339986237
    const HOTEL_LNG = 77.7516429;
    console.log("^^^^^^^^^^^^^^^^^^^^^", await TaskManager.getRegisteredTasksAsync());


    await Location.startGeofencingAsync(GEOFENCE_TASK, [
      {
        latitude: HOTEL_LAT,
        longitude: HOTEL_LNG,
        radius: 50, // meters // TODO :: fetch from server
        notifyOnEnter: true,
        notifyOnExit: true,
      },
    ]);
    console.log("End of initGeofence")
    console.log(JSON.stringify(await TaskManager.getRegisteredTasksAsync()));

  }



  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("msg from app", data);
      if (data.type === "LOGIN_DATA") {
        console.log("Received userId from web:", data.userId);

        await AsyncStorage.setItem("rm_user", JSON.stringify(data));

        console.log("BASE_URL_________", BASE_URL)
        initGeofence();

      }
    } catch (e) {
      console.log("Failed to parse WebView message:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{
          uri: LOGIN_URL,
          headers: {
            "bypass-tunnel-reminder": "true",
            "User-Agent": "ExpoMobileApp", // optional but sometimes required
          },
        }}
        onNavigationStateChange={handleNavChange}
        injectedJavaScript={injectedJavaScript}
        onLoadEnd={async () => {
          if (deviceInfo) {
            console.log("Injected mobile context into WebView");
            const loc = await Location.getLastKnownPositionAsync({});
            console.log("PHONE LOCATION:", loc?.coords);
            // await Location.watchPositionAsync(
            //   { accuracy: Location.Accuracy.Highest, distanceInterval: 1 },
            //   (loc) => {
            //     console.log("LIVE LOCATION:", loc.coords);
            //   }
            // );
            if (await AsyncStorage.getItem("rm_user")) {
              initGeofence();
            }

          }
        }}
        onMessage={handleMessage}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: Platform.OS === "android" ? 25 : 0,
  },
});
