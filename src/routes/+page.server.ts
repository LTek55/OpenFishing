import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { fishCatch } from '$lib/server/db/schema';
import { isNotNull } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const [lures, catchRows] = await Promise.all([
		db.query.lure.findMany({
			with: { tags: true },
			orderBy: (lure, { asc }) => [asc(lure.lureNumber)]
		}),
		db.selectDistinct({ lureId: fishCatch.lureId })
			.from(fishCatch)
			.where(isNotNull(fishCatch.lureId))
	]);

	const lureIdsWithCatches = new Set(catchRows.map(r => r.lureId as string));

	return { lures, lureIdsWithCatches: [...lureIdsWithCatches] };
};
