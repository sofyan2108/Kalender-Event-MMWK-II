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
        name: 'KALENDER EVENT MMWK II',
        short_name: 'MMWK II',
        description: 'Aplikasi Kalender Event dengan Pasaran Jawa',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'fullscreen',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.jpeg',
            sizes: 'any',
            type: 'image/jpeg'
          },
          {
            src: 'icon.jpeg',
            sizes: 'any',
            type: 'image/jpeg',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
