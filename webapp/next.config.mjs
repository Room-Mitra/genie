import withPWA from "next-pwa";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

const version = Date.now();
const runtimeCaching = [
  //  Static assets: images, fonts, etc.
  {
    urlPattern: /^https:\/\/(cdn\.sanity\.io|lh3\.googleusercontent\.com|avatars\.githubusercontent\.com|pub-b7fd9c30cdbf439183b75041f5f71b92\.r2\.dev|roommitra-assets-bucket\.s3\.ap-south-1\.amazonaws\.com|app\.roommitra\.com|app-stage\.roommitra\.com)\/.*$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "assets-cache-v" + version,
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
    },
  },

  // ⚙️ API responses (Room Mitra)
  {
    urlPattern: /^https:\/\/(app(-stage)?\.roommitra\.com)\/api\/.*$/i,
    handler: "NetworkFirst",
    options: {
      cacheName: "api-cache-v" + version,
      networkTimeoutSeconds: 5,
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hour
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },

  // 🌐 HTML navigation pages
  {
    urlPattern: ({ request }) => request.mode === "navigate",
    handler: "NetworkFirst",
    options: {
      cacheName: "pages-cache-v" + version,
      networkTimeoutSeconds: 5,
    },
  },
];

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  swDest: "sw.js",
  runtimeCaching,
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  // output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev" },
      { protocol: "https", hostname: "roommitra-assets-bucket.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "app.roommitra.com" },
      { protocol: "https", hostname: "app-stage.roommitra.com" },
    ],
  },
};

export default withPWAConfig(nextConfig);
