import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render canvas', async () => {
		render(Page);

		const elem = page.getByRole('main');
		await expect.element(elem).toBeInTheDocument();
	});
});
