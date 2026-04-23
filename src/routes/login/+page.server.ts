import { fail, redirect } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

function sessionToken(password: string): string {
	return createHmac('sha256', password).update('openfishing-session').digest('hex');
}

export const load: PageServerLoad = async ({ cookies }) => {
	const password = env.AUTH_PASSWORD;
	if (!password) redirect(303, '/');

	const token = cookies.get('of_session');
	if (token === sessionToken(password)) redirect(303, '/');

	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const password = env.AUTH_PASSWORD;
		if (!password) redirect(303, '/');

		const data = await request.formData();
		const submitted = (data.get('password') as string) ?? '';

		if (submitted !== password) {
			return fail(401, { error: true });
		}

		cookies.set('of_session', sessionToken(password), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: false,
			maxAge: 60 * 60 * 24 * 365
		});

		redirect(303, '/');
	}
};
