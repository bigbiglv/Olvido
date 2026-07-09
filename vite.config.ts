import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

import pkg from './package.json'

import { builtinModules } from 'node:module'

const builtins = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)]

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    watch: {
      ignored: ['**/prisma/config.json*', '**/prisma/*.db*'],
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    electron({
      main: {
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                ...builtins,
                ...Object.keys(pkg.dependencies || {}),
                '@prisma/client',
                '.prisma/client',
              ],
            },
          },
        },
      },
      preload: {
        input: 'electron/preload/index.ts',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
