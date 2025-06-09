import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const apiUrl = env.VITE_API_URL || 'https://hiking-training-planner.onrender.com';
  
  return {
    plugins: [react()],
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        VITE_API_URL: JSON.stringify(apiUrl)
      }
    },
    server: {
      port: 3000,
      proxy: !isProduction ? {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      } : undefined,
      open: true,
      cors: true
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion']
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Generate manifest.json for PWA
      manifest: true,
      // Output directory for assets (relative to outDir)
      assetsInlineLimit: 4096, // 4kb
      // Minify CSS and JS
      minify: isProduction ? 'esbuild' : false,
      // Source maps
      sourcemap: isProduction ? 'hidden' : true,
      // Chunk size warning limit (in kbs)
      chunkSizeWarningLimit: 1000,
      // Rollup options
      rollupOptions: {
        output: {
          // Split chunks
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Split node_modules into vendor chunks
              const module = id.toString().split('node_modules/')[1].split('/')[0];
              return `vendor-${module}`;
            }
          },
          // Entry file names
          entryFileNames: 'assets/js/[name]-[hash].js',
          // Chunk file names
          chunkFileNames: 'assets/js/[name]-[hash].js',
          // Asset file names
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\\.(png|jpe?g|svg|gif|webp|avif)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/\\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            if (/\\.css$/i.test(assetInfo.name)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
    },
  };
});