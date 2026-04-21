import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { spot, spotTag, spotPhoto } from '$lib/server/db/schema';
import { saveUpload } from '$lib/server/uploads';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const name = (data.get('name') as string)?.trim() || 'Untitled Spot';
		const latRaw = (data.get('lat') as string)?.trim();
		const lngRaw = (data.get('lng') as string)?.trim();
		const notes = (data.get('notes') as string)?.trim() || null;
		const tagsRaw = (data.get('tags') as string)?.trim();

		if (!latRaw || !lngRaw) return fail(400, { error: 'locationRequired' });
		const lat = parseFloat(latRaw);
		const lng = parseFloat(lngRaw);
		if (isNaN(lat) || isNaN(lng)) return fail(400, { error: 'locationRequired' });

		const [newSpot] = await db.insert(spot).values({ name, lat, lng, notes }).returning();

		if (tagsRaw) {
			const tagNames = tagsRaw.split(/\s+/).filter(Boolean);
			if (tagNames.length > 0) {
				await db.insert(spotTag).values(tagNames.map((n) => ({ spotId: newSpot.id, name: n })));
			}
		}

		const photoFiles = data.getAll('photos') as File[];
		const validPhotos = photoFiles.filter((f) => f && f.size > 0);
		if (validPhotos.length > 0) {
			const filenames = await Promise.all(validPhotos.map((f) => saveUpload(f)));
			await db.insert(spotPhoto).values(
				filenames.map((filename, i) => ({ spotId: newSpot.id, filename, sortOrder: i }))
			);
		}

		redirect(303, `/spots/${newSpot.id}`);
	}
};
