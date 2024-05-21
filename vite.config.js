import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

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
        start_url: '/', // Cambiado a '/'
        screenshots: [
          {
            src: '/screenshot1.png', // Cambiado de '/colemangym/screenshot1.png'
            sizes: '1365x603',
            type: 'image/png',
          },
        ],
        icons: [
          {
            src: '/logo60x60.png', // Cambiado de '/colemangym/logo60x60.png'
            sizes: '60x60',
            type: 'image/png',
          },
          {
            src: '/logo192x192.png', // Cambiado de '/colemangym/logo192x192.png'
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logo512x512.png', // Cambiado de '/colemangym/logo512x512.png'
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ]
      }
    })
  ],
})
