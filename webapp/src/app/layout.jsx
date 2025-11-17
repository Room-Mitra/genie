import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import SWSetup from "./sw-setup";
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
  return (
    <html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          <SWSetup />
          {children}
        </Providers>
        <ToastContainer />
      </body>
    </html>
  );
}


function Head() {
  return (
    <>
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/images/room-mitra-square-logo.png" sizes="32x32" />
      <link rel="icon" href="/images/room-mitra-square-logo.png" sizes="16x16" />
      <link rel="apple-touch-icon" href="/images/room-mitra-square-logo.png" />
      <meta name="theme-color" content="#0b5fff" />
      <meta name="mobile-web-app-capable" content="yes" />
    </>
  );
}
