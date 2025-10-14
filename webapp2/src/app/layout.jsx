import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";

export const metadata = {
  title: {
    template: "%s | Room Mitra Dashboard",
    default: "Room Mitra Dashboard",
  },
  description: "Room Mitra dashboard to manage guest requests",
};

export default function RootLayout({ children, params }) {
  params.then((c) => console.log(c));
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />

          {children}
        </Providers>
      </body>
    </html>
  );
}
