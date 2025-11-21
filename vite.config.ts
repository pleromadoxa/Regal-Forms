
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom plugin to ensure static files are copied and SPA routing works
const customBuildSteps = () => {
  return {
    name: 'custom-build-steps',
    closeBundle: async () => {
      const distDir = path.resolve(__dirname, 'dist');
      
      // 1. Copy metadata.json if it exists (Crucial for platform integration)
      const metadataPath = path.resolve(__dirname, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        fs.copyFileSync(metadataPath, path.join(distDir, 'metadata.json'));
        console.log('✓ Copied metadata.json to dist/');
      }

      // 2. Create 404.html for SPA routing (Static hosts need this to redirect to index.html)
      const indexHtmlPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtmlPath)) {
        fs.copyFileSync(indexHtmlPath, path.join(distDir, '404.html'));
        console.log('✓ Created 404.html for SPA routing');
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Using path.resolve('.') as a safe alternative to process.cwd() to avoid type issues
  const env = loadEnv(mode, path.resolve('.'), '');

  return {
    plugins: [react(), customBuildSteps()],
    base: './', // Ensures assets are linked relatively (helps with sub-path deployment)
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    // Explicitly define process.env.API_KEY to make it available in the browser
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    },
  };
});
