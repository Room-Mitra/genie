import withPWA from "next-pwa";

const version = Date.now();

const runtimeCaching = [
  {
    urlPattern: /^https:\/\/(cdn\.sanity\.io|lh3\.googleusercontent\.com|avatars\.githubusercontent\.com|pub-b7fd9c30cdbf439183b75041f5f71b92\.r2\.dev|roommitra-assets-bucket\.s3\.ap-south-1\.amazonaws\.com)\/.*$/i,
    handler: "CacheFirst",
    options: {
      cacheName: `assets-cache-${version}`,
      expiration: { maxEntries: 100, maxAgeSeconds: 604800 }
    }
  },
  {
    urlPattern: /^https:\/\/(app(-stage)?\.roommitra\.com)\/api\/.*$/i,
    handler: "NetworkFirst",
    options: {
      cacheName: `api-cache-${version}`,
      expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
      cacheableResponse: { statuses: [0, 200] }
    }
  },
  {
    urlPattern: ({ request }) => request.mode === "navigate",
    handler: "NetworkFirst",
    options: { cacheName: `pages-cache-${version}` }
  }
];

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev" },
      { protocol: "https", hostname: "roommitra-assets-bucket.s3.ap-south-1.amazonaws.com" }
    ]
  }
};

export default withPWAConfig(nextConfig);
