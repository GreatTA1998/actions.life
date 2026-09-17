import vercel from '@sveltejs/adapter-vercel'
import staticAdapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const capacitor = process.env.CAPACITOR === '1'

// https://kit.svelte.dev/docs/integrations
const config = {
	preprocess: vitePreprocess({ scss: true }),
	kit: {
		adapter: capacitor
			? staticAdapter({
					pages: 'build',
					assets: 'build',
					fallback: 'index.html',
					precompress: false
				})
			: vercel(),
		...(capacitor && {
			output: {
				// Capacitor's local server is HTTP/1; one bundle avoids connection limits.
				bundleStrategy: 'single'
			}
		})
	},
	compilerOptions: {
		warningFilter: (warning) => {
			return !warning.filename?.includes('node_modules') 
				&& !warning.code.startsWith('a11y') 
				&& warning.code !== 'css_unused_selector'
		}
	}
};

export default config
