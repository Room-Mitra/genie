import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    appDir: true, // ensures compatibility with the App Router
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev" },
      { protocol: "https", hostname: "roommitra-assets-bucket.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "app.roommitra.com" },
    ],
  },
};

// Wrap the config with PWA
export default withPWA(nextConfig);
