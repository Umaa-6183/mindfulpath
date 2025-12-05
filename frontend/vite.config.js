import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 1. Fixes the "Large Chunk" warning during 'npm run build'
  build: {
    chunkSizeWarningLimit: 1000, // Increases limit to 1000kB (1MB) to reduce noise
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Separate heavy Charting libraries
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts';
            }
            // Separate everything else into a vendor file
            return 'vendor';
          }
        },
      },
    },
  },

  // 2. Configures your Local Development Server ('npm run dev')
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Updated to match your api.js IP address
        target: 'http://3.27.240.110:8000', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})