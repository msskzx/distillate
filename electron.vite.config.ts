import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'node:path'
import { rendererDevServerPort } from './src/shared/runtime'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      // Sandboxed Electron preload scripts do not support ESM. Keep the
      // renderer sandboxed and emit a CommonJS preload instead.
      lib: {
        formats: ['cjs'],
      },
    },
  },
  renderer: {
    server: {
      port: rendererDevServerPort,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [react(), tailwindcss()],
  },
})
