import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { spot, spotTag, spotPhoto } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const spots = await db.query.spot.findMany({
		orderBy: [asc(spot.createdAt)],
		with: {
			tags: true,
			photos: { orderBy: [asc(spotPhoto.sortOrder)], limit: 1 }
		}
	});
	return { spots };
};
