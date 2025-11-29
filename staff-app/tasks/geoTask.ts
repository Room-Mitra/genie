import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';

const API_BACKEND_URL = Constants.expoConfig?.extra?.API_BACKEND_URL || `https://app.roommitra.com`;

export const GEOFENCE_TASK = "rm-geofence-task";

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Geofence error:", error);
    return;
  }

  const event = (data as { eventType: Location.GeofencingEventType }).eventType;
  console.log("GEOFENCE EVENT:", event);

  // Send notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Geofence Triggered',
      body: event === Location.GeofencingEventType.Enter ? 'Entered geofence!' : 'Exited geofence!',
      sound: true,
    },
    trigger: null, // immediate
  });
  console.log("Notification sent");
  const loc = await Location.getLastKnownPositionAsync({});
  console.log("PHONE LOCATION:", loc?.coords);

  const onDuty = event === Location.GeofencingEventType.Enter;
  sendDutyStatus(onDuty, "geo");
});

// Sends update to your backend
async function sendDutyStatus(onDuty: boolean, reason: string) {
  try {
    const userString = await AsyncStorage.getItem("rm_user");
    console.log(userString, "***GEOTASK*****")
    const user = userString ? JSON.parse(userString) : {};
    // const token = await AsyncStorage.getItem("rm_user");
    const token = user.token;
    await fetch(`${API_BACKEND_URL}/staff/duty`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        onDuty,
        reason,
        userId: user["userId"]
      }),
    });
  } catch (err) {
    console.log("Failed auto-duty update:", err);
  }
}
