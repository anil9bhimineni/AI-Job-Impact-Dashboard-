import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20_000,
          groups: [
            { name: 'supabase', test: /node_modules\/(?:@supabase|@types\/ws|isows)/ },
            { name: 'react', test: /node_modules\/(?:react|react-dom|scheduler)/ },
            { name: 'icons', test: /node_modules\/lucide-react/ },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
      '/health': 'http://127.0.0.1:8787',
      '/webhooks': 'http://127.0.0.1:8787',
    },
  },
})
