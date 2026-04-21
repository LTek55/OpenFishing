import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { spot, spotPhoto, fishCatch } from '$lib/server/db/schema';
import { asc, isNotNull } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const [spots, catches] = await Promise.all([
		db.query.spot.findMany({
			orderBy: [asc(spot.createdAt)],
			with: {
				tags: true,
				photos: { orderBy: [asc(spotPhoto.sortOrder)], limit: 1 }
			}
		}),
		db.select({
			id: fishCatch.id,
			lat: fishCatch.lat,
			lng: fishCatch.lng,
			species: fishCatch.species,
			caughtAt: fishCatch.caughtAt
		}).from(fishCatch).where(isNotNull(fishCatch.lat))
	]);
	return { spots, catches };
};
