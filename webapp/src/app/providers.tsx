"use client";

import React from "react";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "next-themes";
import { RequestsProvider } from "@/context/RequestsContext";
import { useEffect } from 'react';
import { registerServiceWorker } from '../lib/sw-register';

export function Providers({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    registerServiceWorker({
      callbacks: {
        onRegistered: (r) => console.log('[App] SW registered', r),
        onWaiting: async (regPromise: any) => {
          let reg = regPromise;
          if (reg && typeof reg.then === 'function') reg = await reg;
          console.log('[App] SW waiting', reg);
        }
      }
    });
  }, []);

  return (
    <UserProvider>
      <RequestsProvider>
        <ThemeProvider defaultTheme="light" attribute="class">
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </RequestsProvider>
    </UserProvider>
  );
}
