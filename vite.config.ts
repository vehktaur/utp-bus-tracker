import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'UTP Bus Tracker',
        short_name: 'Bus Tracker',
        description:
          'Live shuttle bus locations, shared by the people on board.',
        theme_color: '#00a19c',
        background_color: '#f6f8f8',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      { find: '~', replacement: path.resolve(import.meta.dirname, 'src') },
    ],
  },
  server: {
    port: 4100,
    open: true,
    host: true,
  },
  preview: {
    port: 4101,
    open: false,
    host: true,
  },
});
