import { sveltekit } from '@sveltejs/kit/vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

export default {
  server: {
    allowedHosts: ['unwintry-supermorally-irena.ngrok-free.dev'] // for local iOS testing with ngrok
  },
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      manifest: {
        name: 'actions.life',
        display: 'standalone', // display like a native mobile app without browser controls
        icons: [
          { src: '/logo-no-bg.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo-no-bg.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        navigationPreload: false, // reduce memory usage for longer suspension
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.mode === 'navigate',
            handler: 'StaleWhileRevalidate',
            options: {
              networkTimeoutSeconds: 2,
              cacheName: 'app-shell',
              matchOptions: { ignoreVary: true },
              expiration: { purgeOnQuotaError: true }
            }
          }
        ]
      }
    })
  ]
}