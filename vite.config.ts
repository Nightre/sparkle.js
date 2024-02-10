import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.ts',
      name: 'sparkle-engine',
      fileName: 'sparkle'
    },
  },
  server: {
    open: './test/index.html'
  }
})
