import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "The Lantern Trail",
        short_name: "Lantern Trail",
        description: "A bedtime devotional adventure for children aged 2–12.",
        theme_color: "#0F1D38",
        background_color: "#0F1D38",
        display: "standalone",
        start_url: "./",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App shell is cached; trail content is fetched fresh when online and falls back to cache offline.
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.includes("/content/"), handler: "NetworkFirst", options: { cacheName: "trail-content" } },
          { urlPattern: ({ url }) => url.origin.includes("fonts.g"), handler: "StaleWhileRevalidate", options: { cacheName: "fonts" } },
        ],
      },
    }),
  ],
  test: { include: ["src/**/*.test.ts"] },
});
