// vite.config.ts
/// <reference types="vitest" /> // Add this line for Vitest types
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Enables global APIs like `describe`, `it`, `expect`
    environment: 'jsdom', // Simulates a browser environment for React components
    setupFiles: './tests/setupTests.ts', // Path to your test setup file (optional, but good for RTL)
    // Add any other Vitest configuration here
  },
});