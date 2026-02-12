import vercel from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// https://kit.svelte.dev/docs/integrations
const config = {
	preprocess: vitePreprocess({ scss: true }),
	kit: {
		adapter: vercel(),
	},
	compilerOptions: {
		warningFilter: (warning) => {
			return !warning.filename?.includes('node_modules') 
				&& warning.code !== 'css_unused_selector'
		}
	}
};

export default config
