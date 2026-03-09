import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Genzy Basket",
        short_name: "Genzy Basket",
        theme_color: "#099E0E",
        background_color: "#099E0E",
        display: "standalone",
        icons: [
          {
            src: "/Icon.png",
            sizes: "254x254",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Cache all images automatically
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
      },
    }),
  ],
  base: "/",
  server: {
    host: true,
    strictPort: true,
    allowedHosts: [
      "e1bef59488f9.ngrok-free.app",
      ".ngrok-free.app",
      ".ngrok.io",
    ],
  },
});
