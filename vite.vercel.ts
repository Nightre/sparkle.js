import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions:{
      input:{
        main:"./demo/chrome-dino/index.html"
      }
    }
  },
  server: {
    open: './test/index.html'
  }
})
