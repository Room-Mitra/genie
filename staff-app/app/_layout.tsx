import { Stack } from "expo-router";
import * as Notifications from 'expo-notifications';
import "../tasks/locationTask";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Added missing property
    shouldShowList: false,   // Added missing property
  }),
});
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="webview" options={{ title: "RoomMitra Staff" }} />
    </Stack>
  );
}
