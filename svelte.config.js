import vercel from '@sveltejs/adapter-vercel';
import preprocess from "svelte-preprocess";

// https://kit.svelte.dev/docs/integrations

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({ scss: true }),
	kit: {
		adapter: vercel(),
	}
};

export default config;
