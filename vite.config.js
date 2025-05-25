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
      sourcemap: true
    }
  };
});