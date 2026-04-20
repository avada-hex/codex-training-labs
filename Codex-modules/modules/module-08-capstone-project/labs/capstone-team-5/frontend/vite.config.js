import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:4002'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      include: [
        'src/App.jsx',
        'src/auth.js',
        'src/components/**/*.jsx',
        'src/pages/**/*.{jsx,tsx}',
        'src/routes/**/*.{jsx,tsx}',
        'src/services/**/*.{js,ts}'
      ],
      exclude: ['src/**/.gitkeep', 'src/index.css', 'src/main.jsx'],
      thresholds: {
        statements: 96,
        branches: 96,
        functions: 96,
        lines: 96
      }
    }
  }
});
