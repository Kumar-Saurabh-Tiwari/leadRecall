import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webp}"],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          // Cache HTML with StaleWhileRevalidate for offline support
          {
            urlPattern: /\.html$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "html-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 86400, // 24 hours
              },
            },
          },
          // Cache API responses with NetworkFirst, fallback to cache
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 300, // 5 minutes
              },
            },
          },
          // Cache images and other assets with CacheFirst
          {
            urlPattern: /^https:\/\/.+\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 2592000, // 30 days
              },
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "lead-Recall",
        short_name: "lead-Recall",
        description: "Connect. Capture. Convert. Smart networking for modern events.",
        theme_color: "#6366f1",
        background_color: "#fafafc",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
