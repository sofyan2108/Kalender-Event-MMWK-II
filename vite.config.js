import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Kalender Event Jawa',
        short_name: 'KalenderJawa',
        description: 'Aplikasi Kalender Event dengan Pasaran Jawa',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'fullscreen',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'icon.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
