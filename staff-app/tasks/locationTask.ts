// tasks/locationTask.ts

import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import WifiManager from 'react-native-wifi-reborn';

export const LOCATION_TASK = "rm-location-task";
const API_BACKEND_URL = Constants.expoConfig?.extra?.API_BACKEND_URL || `https://api.roommitra.com`;

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
    console.log("rm_user missing: skipping API");
    return;
  }

  const user = JSON.parse(userStr);
  const token = user.token;

  const deviceStr = await AsyncStorage.getItem("rm_device");
  const device = deviceStr ? JSON.parse(deviceStr) : {};

  // 🔍 Fetch Wi-Fi SSID
  // let wifiSSID = null;
  // let bssid = null;
  // let nearbyWifiList = null;
  // try {
  //   const net = await Network.getNetworkStateAsync();
  //   nearbyWifiList = await WifiManager.loadWifiList();
  //   console.log("list", nearbyWifiList);
  //   console.log("RAW NETWORK OBJ:", JSON.stringify(net, null, 2));
  //   // SSID only visible when wifi, not mobile data
  //   if (net?.type === Network.NetworkStateType.WIFI) {
  //     wifiSSID = net.details?.ssid || null;
  //     bssid = net?.details?.bssid || null;

  //   }
  // } catch (e) {
  //   console.log("Failed reading WiFi SSID:", e);
  // }

  try {
    await fetch(
      `${API_BACKEND_URL}/staff/location`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lat: latitude,
          lng: longitude,
          // wifiSSID,
          // bssid,
          // nearbyWifiList,
          deviceId: device.deviceId || "unknown-device",
          source: "background-location",
        }),
      }
    );

    console.log(
      "Location sent successfully:",
      JSON.stringify({
        lat: latitude,
        lng: longitude,
        // nearbyWifiList,
        // wifiSSID,
        // bssid,
        deviceId: device.deviceId || "unknown-device",
      })
    );
  } catch (err) {
    console.log(" Failed sending location:", err);
  }
});
