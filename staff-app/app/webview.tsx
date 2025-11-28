import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import * as Application from "expo-application";

// const BASE_URL = `https://app.roommitra.com`;
const BASE_URL = "https://angry-suns-think.loca.lt"
const LOGIN_URL = `${BASE_URL}/login`;

export default function WebviewScreen() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // 1. Load device information asynchronously
  useEffect(() => {
    async function loadDeviceInfo() {
      const androidId = Platform.OS === "android"
        ? await Application.getAndroidId()
        : null;

      const iosId = Platform.OS === "ios"
        ? await Application.getIosIdForVendorAsync()
        : null;

      setDeviceInfo({
        deviceId: androidId || iosId || "unknown-device",
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version ?? "unknown",
      });
    }

    loadDeviceInfo();
  }, []);

  const [isLoggedIn, setLoggedIn] = useState(false);

  // 2. Prepare injected JavaScript AFTER device info is available
  const injectedJavaScript = deviceInfo
    ? `
      window.__MOBILE_CONTEXT__ = ${JSON.stringify(deviceInfo)};
      window.dispatchEvent(new Event("mobile-ready"));
      true;
    `
    : "";

  const handleNavChange = (navState: any) => {
    const url = navState.url.toLowerCase();
    if (url === BASE_URL.toLowerCase()) {
      setLoggedIn(true);
      console.log("User logged in inside WebView");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{
          uri: LOGIN_URL,
          headers: {
            "bypass-tunnel-reminder": "true",
            "User-Agent": "ExpoMobileApp", // optional but sometimes required
          },
        }}
        onNavigationStateChange={handleNavChange}
        injectedJavaScript={injectedJavaScript}
        onLoadEnd={() => {
          if (deviceInfo) {
            console.log("Injected mobile context into WebView");
          }
        }}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: Platform.OS === "android" ? 25 : 0,
  },
});
