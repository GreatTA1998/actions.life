import { sveltekit } from '@sveltejs/kit/vite'
import Icons from 'unplugin-icons/vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import UnoCSS from 'unocss/vite'
import { defineConfig, loadEnv } from 'vite'

const PRODUCTION_NATIVE_OAUTH_REDIRECT = 'https://actions.life/auth/callback'

function nativeOauthRedirect (mode) {
  const loaded = loadEnv(mode, process.cwd(), '')
  return (
    process.env.PUBLIC_NATIVE_OAUTH_REDIRECT ||
    loaded.PUBLIC_NATIVE_OAUTH_REDIRECT ||
    ''
  ).trim()
}

export default defineConfig(({ mode }) => {
  const capacitor = process.env.CAPACITOR === '1'
  const nativeRedirect = nativeOauthRedirect(mode)

  if (capacitor) {
    console.log(
      `[build:native] PUBLIC_NATIVE_OAUTH_REDIRECT=${nativeRedirect || `(unset → ${PRODUCTION_NATIVE_OAUTH_REDIRECT})`}`
    )
  }

  return {
    define: {
      'import.meta.env.CAPACITOR': JSON.stringify(capacitor),
      // Vite-define so a gitignored .env.local (or shell env) is inlined even when
      // $env/dynamic/public is empty under adapter-static.
      'import.meta.env.PUBLIC_NATIVE_OAUTH_REDIRECT': JSON.stringify(nativeRedirect)
    },

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
})
