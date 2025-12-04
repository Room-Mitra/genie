// tasks/periodicPingTask.ts
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const PERIODIC_PING_TASK = "rm-periodic-ping-task";
const API_BACKEND_URL = Constants.expoConfig?.extra?.API_BACKEND_URL || `https://api.roommitra.com`;


// DEFINE THE TASK
TaskManager.defineTask(PERIODIC_PING_TASK, async () => {
  try {
    console.log("⏱ Periodic Ping Triggered");

    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    const userStr = await AsyncStorage.getItem("rm_user");
    if (!userStr) return BackgroundFetch.BackgroundFetchResult.NoData;

    const user = JSON.parse(userStr);

    const deviceStr = await AsyncStorage.getItem("rm_device");
    const device = deviceStr ? JSON.parse(deviceStr) : {};

    await fetch(`${API_BACKEND_URL}/staff/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        lat: latitude,
        lng: longitude,
        deviceId: device.deviceId || "unknown-device",
        source: "timer",
      }),
    });

    console.log("Periodic Ping Sent:", latitude, longitude);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.log("Periodic Ping Error:", err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
