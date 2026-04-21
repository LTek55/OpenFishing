import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { fishCatch, catchPhoto } from '$lib/server/db/schema';
import { desc, asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const catches = await db.query.fishCatch.findMany({
		orderBy: [desc(fishCatch.caughtAt)],
		with: {
			photos: { orderBy: [asc(catchPhoto.sortOrder)], limit: 1 },
			lure: true
		}
	});
	return { catches };
};
