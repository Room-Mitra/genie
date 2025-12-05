// tasks/periodicPingTask.ts
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { sendLocationUpdate } from "../services/locationApi";

export const PERIODIC_PING_TASK = "rm-periodic-ping-task";
const API_BACKEND_URL = Constants.expoConfig?.extra?.API_BACKEND_URL || `https://api.roommitra.com`;


// DEFINE THE TASK
TaskManager.defineTask(PERIODIC_PING_TASK, async () => {
  try {
    console.log("Periodic Ping Triggered");

    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    await sendLocationUpdate(latitude, longitude, "timer");

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.log("Periodic Ping Error:", err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
