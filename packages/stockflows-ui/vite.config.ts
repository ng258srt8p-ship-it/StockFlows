import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    // Vite extracts CSS to a separate file in library mode by default
    devSourcemap: true,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'StockFlowsUI',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@shopify/polaris', '@shopify/polaris-icons'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@shopify/polaris': 'Polaris',
          '@shopify/polaris-icons': 'PolarisIcons',
        },
      },
    },
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@stockflows/ui': resolve(__dirname, 'src'),
    },
  },
});