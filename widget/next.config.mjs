/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'roommitra-assets-bucket.s3.ap-south-1.amazonaws.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'widget.roommitra.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'widget-stage.roommitra.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
