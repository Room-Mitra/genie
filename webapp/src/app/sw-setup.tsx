"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/sw-register";

export default function SWSetup() {
  useEffect(() => {
    console.log("[SWSetup] Running SW registration effect");

    registerServiceWorker({
      callbacks: {
        onRegistered: (reg) => console.log("[SWSetup] Registered:", reg),
        onRegisterError: (err) => console.error("[SWSetup] Error:", err),
        onUpdateFound: () => console.log("[SWSetup] Update found"),
        onActivated: () => console.log("[SWSetup] Activated"),
      },
    });
  }, []);

  return null;
}
