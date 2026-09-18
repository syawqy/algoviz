import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Vite's dev server would otherwise return index.html for .css requests made
// before the CSS pipeline is warm, which makes the browser reject the module.
// Serving the stylesheet as a real asset keeps that race from surfacing.
function cssAsAsset(): Plugin {
  return {
    name: 'css-as-asset',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && /^\/src\/.*\.css(\?.*)?$/.test(req.url)) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
          res.end(readFileSync(new URL('.' + req.url.split('?')[0], import.meta.url)));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/algoviz/' : '/',
  root: 'web',
  plugins: [cssAsAsset(), react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8807',
        changeOrigin: false,
      },
    },
  },
});
