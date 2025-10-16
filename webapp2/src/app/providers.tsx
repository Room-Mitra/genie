"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider defaultTheme="light" attribute="class">
        <SidebarProvider>{children}</SidebarProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
