"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { useUser } from "@/context/UserContext";
const MobileContext = createContext(null);

export function MobileProvider({ children }) {
  const [mobile, setMobile] = useState(null);
  const [sentToBackend, setSentToBackend] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    function handleMobileReady() {
      if (window.__MOBILE_CONTEXT__) {
        setMobile(window.__MOBILE_CONTEXT__);
      }
    }

    window.addEventListener("mobile-ready", handleMobileReady);

    // If injected before the listener mounted
    if (window.__MOBILE_CONTEXT__) {
      setMobile(window.__MOBILE_CONTEXT__);
    }

    return () => {
      window.removeEventListener("mobile-ready", handleMobileReady);
    };
  }, []);

  useEffect(() => {
    if (!mobile || !user) return;                // wait for mobile info
    if (sentToBackend) return;          // avoid duplicate requests

    async function sendToServer() {
      try {
        const res = await fetch("/api/staff/register-device", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId: mobile.deviceId,
            platform: mobile.platform,
            appVersion: mobile.appVersion,
            user: user,
          }),
        });

        if (res.ok) {
          setSentToBackend(true);
          console.log("Device info registered with backend");
        } else {
          console.log("Failed to register device");
        }
      } catch (err) {
        console.error("Error sending device info:", err);
      }
    }

    function sendUserDataToStaffApp() {
      if (sessionStorage.getItem("rm_jwt")) {
        const data = {
          ...user,
          token: sessionStorage.getItem("rm_jwt"),
          type: "LOGIN_DATA"
        };

        window.ReactNativeWebView?.postMessage(JSON.stringify(data));
      }
    }
    sendToServer();
    if (/ExpoMobileApp/i.test(navigator.userAgent)) { // ONLY run when inside a mobile WebView
      sendUserDataToStaffApp();
    }
  }, [mobile, sentToBackend, user]);

  return (
    <MobileContext.Provider value={mobile}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobile() {
  return useContext(MobileContext);
}
