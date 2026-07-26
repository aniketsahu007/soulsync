import path from "path";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
      hmr: {
        overlay: false, // Keep the laggy overlay disabled
      },
      watch: {
        usePolling: true,   // ESSENTIAL for OneDrive/Windows stability
        interval: 2000,     // Increased to 2s to reduce CPU load and "not stable" refreshes
        binaryInterval: 3000,
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/.tanstack/**', 
          '**/*.tmp',
          '**/~$*',
        ],
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      force: false,
      include: [
        'react', 'react-dom', 'lucide-react', 'recharts', 'framer-motion', 
        '@supabase/supabase-js'
      ],
      // @xenova/transformers uses WASM + dynamic imports internally — must be excluded
      // from pre-bundling or it silently breaks in browser dev mode.
      // We also MUST exclude onnxruntime-web, otherwise Vite corrupts the WASM backend
      // causing "Cannot read properties of undefined (reading 'registerBackend')".
      exclude: ['@xenova/transformers', 'onnxruntime-web'],
    },
    define: envDefine,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tanstackStart({
        server: {
          preset: 'cloudflare-workers'
        }
      }),
      viteReact(),
      VitePWA({
        outDir: "dist/client",
        injectRegister: null,
        registerType: "prompt",
        integration: {
          configureOptions(viteOptions) {
            viteOptions.build.ssr = false;
          },
        },
        includeAssets: [
          "logo.png",
          "offline.html",
          "icons/apple-touch-icon.png",
        ],
        manifest: {
          name: "SoulSync",
          short_name: "SoulSync",
          description:
            "A safe, anonymous emotional support space for students.",
          theme_color: "#10b981",
          background_color: "#f7fbf8",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          scope: "/",
          id: "/",
          icons: [
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/icons/maskable-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/icons/maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: false,
          skipWaiting: false,
          navigateFallback: null,
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,webp,woff,woff2}",
          ],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*$/i,
              handler: "NetworkOnly",
              options: {
                cacheName: "supabase-network-only",
              },
            },
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "soulsync-pages",
                networkTimeoutSeconds: 4,
                expiration: {
                  maxEntries: 24,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                plugins: [
                  {
                    handlerDidError: async () =>
                      (await caches.match("/offline.html")) ?? Response.error(),
                  },
                ],
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "google-fonts-stylesheets",
                expiration: {
                  maxEntries: 8,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: {
                  maxEntries: 12,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ request }) =>
                ["image", "font", "style", "script"].includes(
                  request.destination
                ),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "soulsync-static-assets",
                expiration: {
                  maxEntries: 96,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          navigateFallback: "/",
        },
      }),
    ].filter(Boolean),
  };
});

