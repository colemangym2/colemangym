import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import { Description } from '@mui/icons-material'
import { onBackgroundMessage } from 'firebase/messaging/sw'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      manifest: {
        display: 'standalone',
        display_override: ['windows-controls-overlay'],
        lang: 'es-ES',
        name: 'Coleman Gym',
        short_name: 'Gym',
        description: 'PWA creada',
        theme_color: '#19223c',
        background_color: '#d4d4d4',
        start_url: '/colemangym/index.html', // Asegúrate de que esta ruta sea accesible y cargue correctamente
        screenshots: [
          {
            src: '/colemangym/screenshot1.png',
            sizes: '1365x603',
            type: 'image/png',
          },
        ],
        icons: [
          {
            src: '/colemangym/logo60x60.png',
            sizes: '60x60',
            type: 'image/png',
          },
          {
            src: '/colemangym/logo192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/colemangym/logo512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ]
      }
    })
  ],
})