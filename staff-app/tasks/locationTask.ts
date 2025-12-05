// tasks/locationTask.ts

import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import WifiManager from 'react-native-wifi-reborn';
import { sendLocationUpdate } from "../services/locationApi";

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
    await sendLocationUpdate(latitude, longitude, "background-location");
  } catch (err) {
    console.log(" Failed sending location:", err);
  }
});
