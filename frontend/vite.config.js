import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const brand = JSON.parse(readFileSync(new URL('./brand.json', import.meta.url), 'utf8'))
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('\"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const gymBrand = {
  name: 'gym-brand',
  transformIndexHtml(html) {
    return html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(brand.name)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${escapeHtml(brand.description)}`)
      .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*/, `$1${escapeHtml(brand.shortName)}`)
      .replace(/(<meta name="theme-color" content=")[^"]*/, `$1${brand.themes.dark.background}`)
      .replaceAll('icon-180.png', brand.icon)
  },
  closeBundle() {
    const file = new URL('./dist/manifest.json', import.meta.url)
    if (!existsSync(file)) return
    const manifest = JSON.parse(readFileSync(file, 'utf8'))
    Object.assign(manifest, { name: brand.name, short_name: brand.shortName, description: brand.description,
      background_color: brand.themes.dark.background, theme_color: brand.themes.dark.background,
      icons: [ { src: brand.icon, sizes: '180x180', type: 'image/png', purpose: 'any' },
        { src: brand.largeIcon, sizes: '512x512', type: 'image/png', purpose: 'any maskable' } ] })
    writeFileSync(file, JSON.stringify(manifest, null, 2))
  }
}

const backend = process.env.API_TARGET || 'http://127.0.0.1:3000'
// The API refuses a state-changing request that a browser sent from anywhere other than its own
// ORIGIN (the CSRF guard in api/server.js). The dev server is on a different port, so the page's
// real Origin is not ORIGIN — modern browsers get through on Sec-Fetch-Site: same-origin, and
// presenting the expected Origin here covers the ones that don't send it. Match your .env if you
// changed ORIGIN: API_ORIGIN=https://gym.example.com npm run dev
const apiOrigin = process.env.API_ORIGIN || 'http://localhost:8080'
const media = process.env.MEDIA_TARGET || 'http://127.0.0.1:8888'

// Optional web analytics (Umami). Injected only when BOTH vars are set at build time,
// so a plain `npm run build` — and every self-hosted install — stays telemetry-free.
// Set for the public instance: VITE_UMAMI_SRC=https://stats.example/script.js VITE_UMAMI_ID=<uuid>
const umamiSrc = process.env.VITE_UMAMI_SRC
const umamiId = process.env.VITE_UMAMI_ID

const umami = {
  name: 'opengym-umami',
  transformIndexHtml() {
    if (!umamiSrc || !umamiId) return
    return [{
      tag: 'script',
      attrs: { defer: true, src: umamiSrc, 'data-website-id': umamiId },
      injectTo: 'head'
    }]
  }
}

// The service worker's cache is named after the build (public/sw.js carries a `__BUILD__`
// placeholder): a deploy is then a new worker with its own cache, and the previous build's
// shell and chunks are dropped on activate instead of piling up under one fixed name. The
// stamp is a hash of the built index.html — it changes exactly when the bundle does.
const swStamp = {
  name: 'opengym-sw-stamp',
  apply: 'build',
  closeBundle() {
    const dir = new URL('./dist/', import.meta.url)
    const html = new URL('index.html', dir), sw = new URL('sw.js', dir)
    if (!existsSync(html) || !existsSync(sw)) return
    const stamp = createHash('sha256').update(readFileSync(html)).digest('hex').slice(0, 10)
    writeFileSync(sw, readFileSync(sw, 'utf8').replace('__BUILD__', stamp))
  }
}

// The version people are asked for in #install-help and on every bug report. Read from
// package.json so it cannot drift from the release it was built in, and inlined at build
// time so no runtime fetch is involved.
//
// APP_BUILD, when the build sets it, is appended as "1.3.8+<build>". A packaged build carries a
// version its package.json cannot know — every image built between two releases reports the same
// number, so the one question a bug report turns on, "which build were you running?", had no
// answer from inside the app. Unset (the ordinary case, and every upstream build) it changes
// nothing: the string is exactly package.json's version.
const pkgVersion = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version
const appVersion = process.env.APP_BUILD ? `${pkgVersion}+${process.env.APP_BUILD}` : pkgVersion

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(appVersion) },
  plugins: [react(), umami, gymBrand, swStamp],
  base: './',
  server: {
    // The Coach's core (payload, validator, prompts, HTTP adapters) lives in ../api/coach/core
    // and is imported by the phone build. vite build and vitest already reach it; the dev
    // server needs to be told the workspace is wider than frontend/.
    fs: { allow: ['..'] },
    proxy: {
      '/api': { target: backend, changeOrigin: true, headers: { Origin: apiOrigin } },
      '/img': { target: media, changeOrigin: true },
      '/gif': { target: media, changeOrigin: true }
    }
  },
  build: { chunkSizeWarningLimit: 1500 }
})
