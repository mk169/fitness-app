import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative Pfade, damit der Build auch unter einem Unterpfad
  // (z. B. GitHub Pages: /fitness-app/) korrekt lädt.
  base: "./",
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true },
})
