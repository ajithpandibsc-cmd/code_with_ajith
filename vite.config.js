import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  const isInsideFrontend = __dirname.endsWith('frontend') || path.basename(__dirname) === 'frontend';
  
  const rootDir = isInsideFrontend ? __dirname : path.resolve(__dirname, 'frontend');
  const outDir = isInsideFrontend ? path.resolve(__dirname, '../dist') : path.resolve(__dirname, 'dist');
  const aliasPath = isInsideFrontend ? __dirname : path.resolve(__dirname, 'frontend');

  return {
    root: rootDir,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': aliasPath,
      },
    },
    build: {
      outDir: outDir,
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
