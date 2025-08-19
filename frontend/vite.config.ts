
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'classnames': 'clsx',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      'recharts',
      'axios',
      'dayjs',
      'react-router-dom',
      'clsx'
    ],
    // All icon exclusions have been removed to allow Vite to bundle them.
    exclude: []
  },
  build: {
    rollupOptions: {
      // All external icon entries have been removed.
      external: []
    }
  },
  server: {
    port: 3000,
    open: true
  },
});
