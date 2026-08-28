import { resolve } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { defineConfig } from 'vite'

function demoRoute() {
  return {
    name: 'api-profile-guard-demo-route',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url === '/demo' || request.url === '/demo/') request.url = '/index.html'
        next()
      })
    },
    closeBundle() {
      const output = resolve(import.meta.dirname, 'dist/site')
      const home = readFileSync(resolve(output, 'index.html'), 'utf8')
      const source = home
        .replace('<title>API Profile Guard — block wrong-environment requests</title>', '<title>Demo — API Profile Guard</title>')
        .replaceAll('content="API Profile Guard — block wrong-environment requests"', 'content="Demo — API Profile Guard"')
        .replace('href="https://api-profile-guard.sociobot.in/"', 'href="https://api-profile-guard.sociobot.in/demo/"')
        .replace('content="https://api-profile-guard.sociobot.in/"', 'content="https://api-profile-guard.sociobot.in/demo/"')
      mkdirSync(resolve(output, 'demo'), { recursive: true })
      writeFileSync(resolve(output, 'demo/index.html'), source)
    }
  }
}

export default defineConfig({
  root: 'site',
  publicDir: 'public',
  plugins: [demoRoute()],
  build: {
    outDir: '../dist/site',
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'site/index.html'),
        privacy: resolve(import.meta.dirname, 'site/privacy/index.html'),
        terms: resolve(import.meta.dirname, 'site/terms/index.html'),
        notFound: resolve(import.meta.dirname, 'site/404.html')
      }
    }
  }
})
