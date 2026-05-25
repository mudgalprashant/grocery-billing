import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // Replace 'grocery-billing' with your actual GitHub repo name
  base: '/grocery-billing/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // We manually prompt the user to update
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Grocery Billing',
        short_name: 'GroceryBill',
        description: 'Smart grocery store billing app',
        theme_color: '#1a1a2e',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/grocery-billing/',
        start_url: '/grocery-billing/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache all build assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Cache Firebase & Cloudinary API calls for offline resilience
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
            }
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 604800 }
            }
          }
        ]
      }
    })
  ]
})
