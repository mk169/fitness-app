import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Produktions-Build läuft unter GitHub Pages im Unterpfad /fitness-app/.
  // Absoluter Base-Pfad lädt Assets zuverlässig – auch ohne Trailing-Slash.
  // Dev/Preview bleiben auf "/".
  base: command === "build" ? "/fitness-app/" : "/",
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true },
}))
