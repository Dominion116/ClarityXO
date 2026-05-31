import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'stacks-core':     ['@stacks/transactions', '@stacks/network', '@stacks/common'],
          'stacks-connect':  ['@stacks/connect', '@stacks/auth'],
          'stacks-identity': ['@stacks/bns', '@stacks/profile', '@stacks/stacking'],
          'stacks-data':     ['@stacks/storage', '@stacks/encryption', '@stacks/blockchain-api-client'],
        },
      },
    },
  },
})
