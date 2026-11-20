import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Automatically configure base path when deploying to GitHub Pages
const repoName = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/';

// https://vite.dev/config/
export default defineConfig({
  base: repoName,
  server: {
    host: true, // Listen on all network addresses (0.0.0.0) for phone/LAN testing
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
