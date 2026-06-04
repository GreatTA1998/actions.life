import { sveltekit } from '@sveltejs/kit/vite'
import Icons from 'unplugin-icons/vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import UnoCSS from 'unocss/vite'

export default {
  server: {
    allowedHosts: ['unwintry-supermorally-irena.ngrok-free.dev'] // for local iOS testing with ngrok
  },

  plugins: [
    sveltekit(),
    UnoCSS(),
    Icons({
      compiler: 'svelte'
    }),
    devtoolsJson() // stops Google warning (also potentially useful for debugging)
  ]
}
