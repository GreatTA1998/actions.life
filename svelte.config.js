import vercel from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// https://kit.svelte.dev/docs/integrations
const config = {
	preprocess: vitePreprocess({ scss: true }),
	kit: {
		adapter: vercel(),
		serviceWorker: {
			register: false // Disable SvelteKit's service worker since we're using vite-pwa
		}
	},
	compilerOptions: {
		// disable all warnings coming from node_modules and all accessibility warnings
		warningFilter: (warning) => !warning.filename?.includes('node_modules') && !warning.code.startsWith('a11y')
	}
};

export default config
