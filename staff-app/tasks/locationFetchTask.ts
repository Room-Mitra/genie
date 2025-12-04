// tasks/locationFetchTask.ts
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {
  BackgroundFetchResult,
} from "expo-background-fetch";

export const LOCATION_FETCH_TASK = "rm-location-fetch-task";

TaskManager.defineTask(LOCATION_FETCH_TASK, async () => {
  try {
    console.log("BackgroundFetch: Tick");

    // Get location once
    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    const userStr = await AsyncStorage.getItem("rm_user");
    if (!userStr) {
      console.log("No rm_user found, skipping");
      return BackgroundFetchResult.NoData;
    }

    const user = JSON.parse(userStr);
    const token = user.token;

    const deviceStr = await AsyncStorage.getItem("rm_device");
    const device = deviceStr ? JSON.parse(deviceStr) : {};

    // Send to server
    await fetch(
      `${Constants.expoConfig?.extra?.API_BACKEND_URL}/staff/location`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lat: String(latitude),
          lng: String(longitude),
          wifiSSID: null,
          deviceId: device.deviceId || "unknown-device",
        }),
      }
    );

    console.log("Location sent successfully" + JSON.stringify({
      lat: String(latitude),
      lng: String(longitude),
      wifiSSID: null,
      deviceId: device.deviceId || "unknown-device",
    }));

    return BackgroundFetchResult.NewData;
  } catch (e) {
    console.log("BackgroundFetch failed:", e);
    return BackgroundFetchResult.Failed;
  }
});
