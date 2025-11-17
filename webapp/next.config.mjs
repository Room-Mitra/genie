
import { withSerwist } from "@serwist/next";

const serwistConfig = {
  swSrc: "src/service-workers/sw.js", // the service worker file you will create
  swDest: "public/service-workers/sw.js",
};

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: "",
      },
      {
        protocol: "https",
        hostname: "roommitra-assets-bucket.s3.ap-south-1.amazonaws.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "app.roommitra.com",
        port: "",
      },
    ],
  },
};

// export default nextConfig;
export default withSerwist(nextConfig, serwistConfig);