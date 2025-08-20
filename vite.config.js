import { sveltekit } from '@sveltejs/kit/vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

export default {
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      manifest: {
        name: 'actions.life',
        short_name: 'actions',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          { src: '/logo-no-bg.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo-no-bg.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigationPreload: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'html' }
          }
        ]
      }
    })
  ]
}