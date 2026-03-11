import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/sub': {
        target: 'https://example.com', // placeholder, rewritten below
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Extract the real subscription URL from the query string
            const url = new URL(req.url || '', 'http://localhost')
            const subUrl = url.searchParams.get('url')
            if (subUrl) {
              try {
                const target = new URL(subUrl)
                proxyReq.setHeader('host', target.host)
                // Rewrite the proxy request path to the actual subscription URL
                proxyReq.path = target.pathname + target.search
                // Update the proxy target dynamically
                ;(proxyReq as any).agent = undefined
                const options = (proxy as any).options
                options.target = target.origin
              } catch {
                // Invalid URL, let it fail naturally
              }
            }
          })
        },
      },
    },
  },
})
