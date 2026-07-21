import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/react-app/',
    server: {
    port: 3010,
    host: true, // Allow external access
    proxy: {
      '/api': {
        target: 'https://alyasser-center.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('PROXY REQUEST:', req.method, req.url);
            proxyReq.setHeader('Origin', 'http://localhost:3010');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('PROXY RESPONSE:', proxyRes.statusCode, req.url);
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          });
        }
      }
    }
  }
})
