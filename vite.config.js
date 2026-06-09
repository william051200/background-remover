import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` is set for GitHub Pages project hosting at /background-remover/.
export default defineConfig({
  base: '/background-remover/',
  plugins: [react()],
})
