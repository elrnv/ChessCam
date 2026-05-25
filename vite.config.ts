import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import packageJson from "./package.json";

const buildId = new Date().toISOString().replace(/\D/g, "").slice(0, 14);

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    react(),
    VitePWA({
      workbox: {
        globPatterns: ["**/*"],
        maximumFileSizeToCacheInBytes: 5000000
      },
      includeAssets: [
          "**/*",
      ],
      manifest: {
        "name": "ChessCam",
        "short_name": "ChessCam",
        "start_url": ".",
        "icons": [
          {
              "src": "/android-chrome-192x192.png",
              "sizes": "192x192",
              "type": "image/png"
          },
          {
              "src": "/android-chrome-512x512.png",
              "sizes": "512x512",
              "type": "image/png"
          }
        ],
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "standalone"
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000, // handle warning on vendor.js bundle size
  },
});
