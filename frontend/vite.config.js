import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
      global: 'globalThis',
      process: {
        env: {
          // ...
        },
      },
    },
  server: {
    port: 5173,
    strictPort: true, // Fail if port is unavailable instead of trying another port
    proxy: {
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
