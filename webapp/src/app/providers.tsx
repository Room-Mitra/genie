"use client";

import React from "react";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { UserProvider } from "@/context/UserContext";
import { MobileProvider } from "@/context/MobileContext";
import { ThemeProvider } from "next-themes";
import { RequestsProvider } from "@/context/RequestsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <MobileProvider>
        <RequestsProvider>
          <ThemeProvider defaultTheme="light" attribute="class">
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </RequestsProvider>
      </MobileProvider>
    </UserProvider>
  );
}
