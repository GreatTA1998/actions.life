import { sveltekit } from '@sveltejs/kit/vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

export default {
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
        navigationPreload: true, // fetches server and loads sw in parallel for first-time visitors, false by default because it consumes more memory
        runtimeCaching: [ // cache every visited page for offline use (includes calendar page), off by default because it consumes more memory
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