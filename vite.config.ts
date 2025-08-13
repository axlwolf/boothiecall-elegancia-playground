import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use different base path for different environments
  const isVercel = process.env.VERCEL === '1';
  const base = isVercel ? '/' : '/playground/';
  
  return {
  base,
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React libraries (including React Router to prevent context conflicts)
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/@remix-run/router/')) {
            return 'vendor';
          }
          
          // UI Component libraries
          if (id.includes('node_modules/@radix-ui/') || 
              id.includes('node_modules/lucide-react/') ||
              id.includes('node_modules/@tabler/icons-react/')) {
            return 'ui';
          }
          
          // Data fetching and state management
          if (id.includes('node_modules/@tanstack/react-query/') ||
              id.includes('node_modules/zustand/') ||
              id.includes('node_modules/immer/')) {
            return 'data';
          }
          
          // Utility libraries
          if (id.includes('node_modules/lodash/') ||
              id.includes('node_modules/date-fns/') ||
              id.includes('node_modules/clsx/') ||
              id.includes('node_modules/class-variance-authority/') ||
              id.includes('node_modules/tailwind-merge/')) {
            return 'utils';
          }
          // Admin panel (lazy loaded)
          if (id.includes('/admin/')) {
            return 'admin';
          }
          
          // Photo processing and filters
          if (id.includes('filterEngine') || 
              id.includes('photoProcessor') || 
              id.includes('imageUtils')) {
            return 'photo';
          }
          
          // Templates and designs
          if (id.includes('templateService') || 
              id.includes('frameMappings') || 
              id.includes('/designs/')) {
            return 'templates';
          }
          
          // PWA and service worker
          if (id.includes('pwaService') || 
              id.includes('serviceWorker') || 
              id.includes('cacheService')) {
            return 'pwa';
          }
          
          // Return undefined for no match (important!)
          return undefined;
        },
      },
    },
  },
  };
});
