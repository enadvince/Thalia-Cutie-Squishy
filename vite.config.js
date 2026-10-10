import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import offline from './scripts/offline.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), offline()],
})
