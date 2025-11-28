import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="webview" options={{ title: "RoomMitra Staff" }} />
    </Stack>
  );
}
