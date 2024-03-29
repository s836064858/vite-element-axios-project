import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
const { resolve } = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [],
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      '@api': resolve(__dirname, '/src/api'),
      '@assets': resolve(__dirname, '/src/assets'),
      '@stores': resolve(__dirname, '/src/stores'),
      '@components': resolve(__dirname, '/src/components'),
    },
  },
  server: {
    cors: true,
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
