import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { lure } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params }) => {
	const existing = await db.query.lure.findFirst({
		where: (l, { eq }) => eq(l.id, params.id)
	});
	if (!existing) error(404, 'Lure not found');

	const newVal = !existing.favourite;
	await db.update(lure).set({ favourite: newVal }).where(eq(lure.id, params.id));

	return json({ favourite: newVal });
};
