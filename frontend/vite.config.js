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
  plugins: [react(), tailwindcss()],
});
