import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import http from 'http'
import https from 'https'

/**
 * Custom Vite plugin that acts as a server-side proxy for subscription URLs.
 * Solves CORS by fetching the subscription URL from the server side.
 */
function subscriptionProxyPlugin(): Plugin {
  return {
    name: 'subscription-proxy',
    configureServer(server) {
      server.middlewares.use('/api/sub', (req, res) => {
        const reqUrl = new URL(req.url || '', 'http://localhost')
        const subUrl = reqUrl.searchParams.get('url')

        if (!subUrl) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: '缺少 url 参数' }))
          return
        }

        let targetUrl: URL
        try {
          targetUrl = new URL(subUrl)
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ error: '无效的 URL' }))
          return
        }

        const client = targetUrl.protocol === 'https:' ? https : http

        const proxyReq = client.request(
          subUrl,
          {
            method: 'GET',
            headers: {
              'User-Agent': 'ClashRulesManager/1.0',
              'Accept': '*/*',
            },
            timeout: 15000,
          },
          (proxyRes) => {
            // Handle redirects
            if (
              proxyRes.statusCode &&
              proxyRes.statusCode >= 300 &&
              proxyRes.statusCode < 400 &&
              proxyRes.headers.location
            ) {
              // Follow redirect
              const redirectUrl = proxyRes.headers.location
              const redirectClient = redirectUrl.startsWith('https') ? https : http
              const redirectReq = redirectClient.request(
                redirectUrl,
                {
                  method: 'GET',
                  headers: {
                    'User-Agent': 'ClashRulesManager/1.0',
                    'Accept': '*/*',
                  },
                  timeout: 15000,
                },
                (redirectRes) => {
                  res.statusCode = redirectRes.statusCode || 200
                  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
                  res.setHeader('Access-Control-Allow-Origin', '*')
                  redirectRes.pipe(res)
                },
              )
              redirectReq.on('error', (err) => {
                res.statusCode = 502
                res.end(JSON.stringify({ error: `重定向失败: ${err.message}` }))
              })
              redirectReq.end()
              return
            }

            res.statusCode = proxyRes.statusCode || 200
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.setHeader('Access-Control-Allow-Origin', '*')
            proxyRes.pipe(res)
          },
        )

        proxyReq.on('error', (err) => {
          res.statusCode = 502
          res.end(JSON.stringify({ error: `请求失败: ${err.message}` }))
        })

        proxyReq.on('timeout', () => {
          proxyReq.destroy()
          res.statusCode = 504
          res.end(JSON.stringify({ error: '请求超时 (15s)' }))
        })

        proxyReq.end()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), subscriptionProxyPlugin()],
})
