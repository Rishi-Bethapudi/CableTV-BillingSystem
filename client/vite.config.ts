import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react({
      jsxImportSource: "react",
      tsDecorators: true,
    }),

    mode === "development" && componentTagger(),

    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "CableTV Manager",
        short_name: "CableTV",
        description: "Manage your cable TV business",
        theme_color: "#0f172a",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: { cacheName: "html-cache" },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "static-resources" },
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

  build: {
    target: "es2019",
    cssCodeSplit: true,
    sourcemap: false,

    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },

    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes("react") || id.includes("react-dom")) {
            return "react-core";
          }

          // UI libraries
          if (
            id.includes("@radix-ui") ||
            id.includes("lucide-react") ||
            id.includes("clsx") ||
            id.includes("tailwind")
          ) {
            return "ui";
          }

          // Heavy libs
          if (id.includes("xlsx")) return "xlsx";
          if (id.includes("chart") || id.includes("recharts")) return "charts";
          if (id.includes("react-to-print")) return "print";

          // Networking
          if (id.includes("axios")) return "network";

          // Date / Utils
          if (id.includes("date-fns") || id.includes("moment")) return "date";

          // Everything from node_modules → vendor
          if (id.includes("node_modules")) return "vendor";
        },

        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "axios",
      "xlsx",
      "react-to-print",
      "lucide-react",
    ],
  },
}));
