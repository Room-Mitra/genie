import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { useEffect } from "react";
import { requestFcmToken, onForegroundMessage } from "@/lib/firebaseClient";

export default function AppLayout({ children }) {

  useEffect(() => {
    (async () => {
      const token = await requestFcmToken();
      if (token) {
        // send token to your backend: associate token with staff id
        await fetch("/pushNotification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: { token, staffId: "YOUR-STAFF-ID" },
        });
      }
    })();

    onForegroundMessage((payload) => {
      console.log("Foreground message:", payload);
      // optionally show custom UI in the app
    });
  }, []);

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="w-full bg-gray-2 dark:bg-slate-950">
          <Header />

          <main className="isolate mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
