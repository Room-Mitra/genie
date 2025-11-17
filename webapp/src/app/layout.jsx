import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: {
    template: "%s | Room Mitra Dashboard",
    default: "Room Mitra Dashboard",
  },
  description: "Room Mitra dashboard to manage guest requests",
};

export default function RootLayout({ children }) {

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch((err) => console.log("SW registration failed", err));
    }
  }, []);


  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />

          {children}
        </Providers>
        <ToastContainer />

        <script dangerouslySetInnerHTML={{
          __html: `
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.register("/service-workers/sw.js").catch(console.error);
            }
          `
        }} />
      </body>
    </html>
  );
}
