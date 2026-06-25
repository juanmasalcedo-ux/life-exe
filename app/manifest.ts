import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Manny Tracker 2000',
    short_name: 'Manny 2000',
    description: 'Habit tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9FAFB',
    theme_color: '#6366F1',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
