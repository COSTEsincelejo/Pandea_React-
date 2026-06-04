import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'es-toolkit/compat/get': resolve(__dirname, 'node_modules/es-toolkit/compat/get.js'),
      'es-toolkit/compat/isPlainObject': resolve(__dirname, 'node_modules/es-toolkit/compat/isPlainObject.js'),
      'es-toolkit/compat/last': resolve(__dirname, 'node_modules/es-toolkit/compat/last.js'),
      'es-toolkit/compat/maxBy': resolve(__dirname, 'node_modules/es-toolkit/compat/maxBy.js'),
      'es-toolkit/compat/minBy': resolve(__dirname, 'node_modules/es-toolkit/compat/minBy.js'),
      'es-toolkit/compat/omit': resolve(__dirname, 'node_modules/es-toolkit/compat/omit.js'),
      'es-toolkit/compat/range': resolve(__dirname, 'node_modules/es-toolkit/compat/range.js'),
      'es-toolkit/compat/sortBy': resolve(__dirname, 'node_modules/es-toolkit/compat/sortBy.js'),
      'es-toolkit/compat/sumBy': resolve(__dirname, 'node_modules/es-toolkit/compat/sumBy.js'),
      'es-toolkit/compat/throttle': resolve(__dirname, 'node_modules/es-toolkit/compat/throttle.js'),
      'es-toolkit/compat/uniqBy': resolve(__dirname, 'node_modules/es-toolkit/compat/uniqBy.js'),
    },
  },
  optimizeDeps: {
    include: ['recharts', 'es-toolkit'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})
