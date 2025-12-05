// services/locationApi.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_BACKEND_URL =
  Constants.expoConfig?.extra?.API_BACKEND_URL || "https://api.roommitra.com";

export type LocationPayload = {
  lat: number;
  lng: number;
  deviceId: string;
  source: "background-location" | "timer" | string;
};

export async function sendLocationUpdate(
  lat: number,
  lng: number,
  source: string
): Promise<void> {
  try {
    const userStr = await AsyncStorage.getItem("rm_user");
    if (!userStr) {
      console.log("No rm_user found, skipping location update");
      return;
    }

    const user = JSON.parse(userStr);
    const token = user.token;

    const deviceStr = await AsyncStorage.getItem("rm_device");
    const device = deviceStr ? JSON.parse(deviceStr) : {};

    const payload: LocationPayload = {
      lat,
      lng,
      deviceId: device.deviceId || "unknown-device",
      source,
    };

    console.log("Sending staff location...", payload);

    const res = await fetch(`${API_BACKEND_URL}/staff/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.log(` Failed staff/location call — Status: ${res.status}`);
      return;
    }

    console.log(`Location sent (${payload})`);
  } catch (err) {
    console.log(" Location API error:", err);
  }
}
