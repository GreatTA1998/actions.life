import vercel from '@sveltejs/adapter-vercel';
import preprocess from "svelte-preprocess";

// https://kit.svelte.dev/docs/integrations

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({ scss: true }),
	kit: {
		adapter: vercel(),
	},
	compilerOptions: {
		// disable all warnings coming from node_modules and all accessibility warnings
		warningFilter: (warning) => !warning.filename?.includes('node_modules') && !warning.code.startsWith('a11y')
	}
};

export default config;
