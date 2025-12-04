// tasks/locationTask.ts

import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const LOCATION_TASK = "rm-location-task";

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.log("Location Task Error:", error);
    return;
  }

  const { locations } = data as any;
  if (!locations || locations.length === 0) return;

  const { latitude, longitude } = locations[0].coords;
  console.log(" Location Tick:", latitude, longitude);

  const userStr = await AsyncStorage.getItem("rm_user");
  if (!userStr) {
    console.log("⚠️ rm_user missing: skipping API");
    return;
  }

  const user = JSON.parse(userStr);
  const token = user.token;

  const deviceStr = await AsyncStorage.getItem("rm_device");
  const device = deviceStr ? JSON.parse(deviceStr) : {};

  try {
    await fetch(`${Constants.expoConfig?.extra?.API_BACKEND_URL}/staff/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lat: latitude,
        lng: longitude,
        deviceId: device.deviceId || "unknown-device",
        source: "background-location",
      }),
    });

    console.log(
      "Location sent successfully:", Date.now(),
      JSON.stringify({
        lat: latitude,
        lng: longitude,
        deviceId: device.deviceId || "unknown-device",
      })
    );
  } catch (err) {
    console.log(" Failed sending location:", err);
  }
});
