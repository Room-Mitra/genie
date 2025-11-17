import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RoomMitra Staff APP',
    short_name: 'RoomMitra',
    description: 'PWA for RoomMitra Staff to get updates on guest requests',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/images/logo/logo.svg',
        sizes: '192x192',
        type: 'image/svg',
      },
      {
        src: '/images/logo/logo.svg',
        sizes: '512x512',
        type: 'image/svg',
      },
    ],
  }
}