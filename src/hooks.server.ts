import { redirect, type Handle } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';
import { env } from '$env/dynamic/private';

function sessionToken(password: string): string {
	return createHmac('sha256', password).update('openfishing-session').digest('hex');
}

export const handle: Handle = async ({ event, resolve }) => {
	const password = env.AUTH_PASSWORD;

	// Auth disabled when no password is configured
	if (!password) return resolve(event);

	// Login page is always accessible
	if (event.url.pathname === '/login') return resolve(event);

	const token = event.cookies.get('of_session');
	if (token !== sessionToken(password)) {
		redirect(303, '/login');
	}

	return resolve(event);
};
