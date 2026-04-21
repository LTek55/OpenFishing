<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import 'leaflet/dist/leaflet.css';

	let { data }: { data: PageData } = $props();
	const { t, spot, nearbyCatches } = data;

	let mapEl: HTMLElement;
	let mapInstance: any = null;
	let currentPhoto = $state(0);

	const photos = spot.photos;
	const hasPhotos = photos.length > 0;

	function prevPhoto() { currentPhoto = (currentPhoto - 1 + photos.length) % photos.length; }
	function nextPhoto() { currentPhoto = (currentPhoto + 1) % photos.length; }

	onMount(async () => {
		const L = (await import('leaflet')).default;

		const pinIcon = L.divIcon({
			html: `<svg width="28" height="38" viewBox="0 0 28 38" fill="none"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#06b6d4"/><circle cx="14" cy="14" r="5" fill="#030a12"/></svg>`,
			className: '', iconSize: [28, 38], iconAnchor: [14, 38]
		});

		mapInstance = L.map(mapEl, { zoomControl: true, scrollWheelZoom: false });

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 19
		}).addTo(mapInstance);

		mapInstance.setView([spot.lat, spot.lng], 15);
		L.marker([spot.lat, spot.lng], { icon: pinIcon }).addTo(mapInstance);
		requestAnimationFrame(() => mapInstance.invalidateSize());
	});

	onDestroy(() => { mapInstance?.remove(); });

	function formatCoord(n: number) { return n.toFixed(6); }

	function formatDate(d: Date) {
		return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function lureName(l: { lureNumber: number | null; name: string }) {
		return l.lureNumber ? `#${String(l.lureNumber).padStart(4, '0')} ${l.name}` : l.name;
	}
</script>

<div style="max-width:680px;">
	<!-- Map -->
	<div style="border-radius:14px; overflow:hidden; border:1px solid #172f4a; margin-bottom:16px;">
		<div bind:this={mapEl} style="height:300px;"></div>
	</div>

	<!-- Photo slider -->
	{#if hasPhotos}
		<div style="position:relative; border-radius:14px; overflow:hidden; background:#0d1f35; aspect-ratio:16/9; margin-bottom:16px;">
			{#each photos as photo, i}
				<img
					src="/uploads/{photo.filename}"
					alt="{spot.name} photo {i + 1}"
					style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:opacity 0.3s; opacity:{i === currentPhoto ? '1' : '0'}; pointer-events:{i === currentPhoto ? 'auto' : 'none'};"
				/>
			{/each}

			{#if photos.length > 1}
				<button onclick={prevPhoto} aria-label="Previous"
					style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); border:none; color:#EDF5FA; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; backdrop-filter:blur(4px);">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button>
				<button onclick={nextPhoto} aria-label="Next"
					style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); border:none; color:#EDF5FA; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; backdrop-filter:blur(4px);">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button>

				<!-- Dots -->
				<div style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; gap:5px;">
					{#each photos as _, i}
						<button onclick={() => currentPhoto = i}
							style="width:{i === currentPhoto ? '18px' : '6px'}; height:6px; border-radius:3px; background:{i === currentPhoto ? '#22d3ee' : 'rgba(255,255,255,0.4)'}; border:none; cursor:pointer; transition:all 0.2s; padding:0;"
							aria-label="Photo {i + 1}"
						></button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Info card -->
	<div style="background:#0b1a2c; border:1px solid #172f4a; border-radius:14px; padding:20px; display:flex; flex-direction:column; gap:16px;">

		<!-- Name + coordinates + directions -->
		<div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;">
			<div>
				<h1 style="font-family:'Carter One',sans-serif; font-size:1.4rem; color:#e0eaf8; margin:0 0 4px;">{spot.name}</h1>
				<p style="font-family:'JetBrains Mono',monospace; font-size:0.72rem; color:#3d6a84; margin:0;">{formatCoord(spot.lat)}, {formatCoord(spot.lng)}</p>
			</div>
			<a href="https://www.google.com/maps/dir/?api=1&destination={spot.lat},{spot.lng}" target="_blank" rel="noopener noreferrer"
				style="display:inline-flex; align-items:center; gap:6px; background:#0f2238; color:#8ab8cc; font-size:0.8rem; font-weight:500; padding:8px 14px; border-radius:8px; border:1px solid #243f5e; text-decoration:none; white-space:nowrap; transition:all 0.15s; font-family:'DM Sans',sans-serif; flex-shrink:0;"
				onmouseenter={function(e){(e.currentTarget as HTMLElement).style.borderColor='rgba(6,182,212,0.4)'; (e.currentTarget as HTMLElement).style.color='#22d3ee';}}
				onmouseleave={function(e){(e.currentTarget as HTMLElement).style.borderColor='#243f5e'; (e.currentTarget as HTMLElement).style.color='#8ab8cc';}}
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none">
					<path d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z" stroke="currentColor" stroke-width="1.6"/>
					<circle cx="12" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/>
				</svg>
				{t.spotGetDirections}
			</a>
		</div>

		{#if spot.tags.length > 0}
			<div>
				<p style="font-size:0.72rem; font-weight:500; color:#3d6a84; text-transform:uppercase; letter-spacing:0.06em; margin:0 0 8px;">{t.spotTagsLabel}</p>
				<div style="display:flex; flex-wrap:wrap; gap:6px;">
					{#each spot.tags as tag}
						<span style="font-size:0.78rem; font-weight:600; color:#5d8fa8; background:rgba(93,143,168,0.1); border:1px solid rgba(93,143,168,0.2); padding:3px 10px; border-radius:20px;">{tag.name}</span>
					{/each}
				</div>
			</div>
		{/if}

		{#if spot.notes}
			<div>
				<p style="font-size:0.72rem; font-weight:500; color:#3d6a84; text-transform:uppercase; letter-spacing:0.06em; margin:0 0 6px;">{t.spotNotesLabel}</p>
				<p style="font-size:0.875rem; color:#8ab8cc; margin:0; line-height:1.6; white-space:pre-wrap;">{spot.notes}</p>
			</div>
		{/if}

		<!-- Edit -->
		<div style="display:flex; gap:8px; padding-top:16px; border-top:1px solid #172f4a; margin-top:16px;">
			<a href="/spots/{spot.id}/edit"
				style="display:inline-block; background:#06b6d4; color:#030a12; font-size:0.875rem; font-weight:600; padding:9px 20px; border-radius:9px; text-decoration:none; transition:background 0.15s; font-family:'DM Sans',sans-serif;"
				onmouseenter={function(e){(e.currentTarget as HTMLElement).style.background='#22d3ee';}}
				onmouseleave={function(e){(e.currentTarget as HTMLElement).style.background='#06b6d4';}}
			>
				{t.edit}
			</a>
		</div>
	</div>

	<!-- Nearby catches -->
	<div style="background:#0b1a2c; border:1px solid #172f4a; border-radius:14px; padding:20px; margin-top:16px;">
		<p style="font-family:'Carter One',sans-serif; font-size:1rem; color:#e0eaf8; margin:0 0 14px;">{t.navCatches}</p>

		{#if nearbyCatches.length === 0}
			<p style="font-size:0.875rem; color:#3d6a84; margin:0;">{t.catchNoItems}</p>
		{:else}
			<div style="overflow-x:auto;">
				<table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
					<thead>
						<tr style="border-bottom:1px solid #172f4a;">
							<th style="text-align:left; font-size:0.68rem; font-weight:500; color:#3d6a84; text-transform:uppercase; letter-spacing:0.06em; padding:0 12px 8px 0;"></th>
							<th style="text-align:left; font-size:0.68rem; font-weight:500; color:#3d6a84; text-transform:uppercase; letter-spacing:0.06em; padding:0 12px 8px 0;">{t.catchSpeciesLabel}</th>
							<th style="text-align:left; font-size:0.68rem; font-weight:500; color:#3d6a84; text-transform:uppercase; letter-spacing:0.06em; padding:0 12px 8px 0;">{t.catchDateLabel}</th>
							<th style="text-align:right; font-size:0.68rem; font-weight:500; color:#3d6a84; text-transform:uppercase; letter-spacing:0.06em; padding:0 12px 8px 0;">{t.catchLengthLabel}</th>
							<th style="text-align:right; font-size:0.68rem; font-weight:500; color:#3d6a84; text-transform:uppercase; letter-spacing:0.06em; padding:0 0 8px 0;">{t.catchWeightLabel}</th>
							<th style="text-align:left; font-size:0.68rem; font-weight:500; color:#3d6a84; text-transform:uppercase; letter-spacing:0.06em; padding:0 0 8px 12px;">{t.catchLureLabel}</th>
						</tr>
					</thead>
					<tbody>
						{#each nearbyCatches as c}
							<tr style="border-bottom:1px solid #0f2238; cursor:pointer;"
								onclick={() => window.location.href = `/catches/${c.id}`}
								onmouseenter={function(e){(e.currentTarget as HTMLElement).style.background='rgba(6,182,212,0.04)';}}
								onmouseleave={function(e){(e.currentTarget as HTMLElement).style.background='';}}
							>
								<!-- Thumbnail -->
								<td style="padding:8px 10px 8px 0; width:40px;">
									{#if c.photos.length > 0}
										<div style="width:36px; height:28px; border-radius:5px; overflow:hidden; flex-shrink:0;">
											<img src="/uploads/{c.photos[0].filename}" alt="" style="width:100%; height:100%; object-fit:cover;" />
										</div>
									{:else}
										<div style="width:36px; height:28px; border-radius:5px; background:#0d1f35; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:#1d3d5c;">
												<path d="M2 12 C4 8 7 6 10 7 C13 8 14 11 17 11 C20 11 22 9 22 9 C22 9 21 14 18 15 C15 16 13 14 10 14 C7 14 4 16 2 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
											</svg>
										</div>
									{/if}
								</td>
								<td style="padding:8px 12px 8px 0; font-weight:600; color:#c2dce8; white-space:nowrap;">{c.species ?? '—'}</td>
								<td style="padding:8px 12px 8px 0; color:#5d8fa8; white-space:nowrap;">{formatDate(c.caughtAt)}</td>
								<td style="padding:8px 12px 8px 0; color:#22d3ee; font-family:'JetBrains Mono',monospace; text-align:right; white-space:nowrap;">{c.lengthCm != null ? `${c.lengthCm}` : '—'}</td>
								<td style="padding:8px 0 8px 0; color:#22d3ee; font-family:'JetBrains Mono',monospace; text-align:right; white-space:nowrap;">{c.weightG != null ? `${c.weightG}` : '—'}</td>
								<td style="padding:8px 0 8px 12px; color:#5d8fa8; white-space:nowrap; max-width:120px; overflow:hidden; text-overflow:ellipsis;">
									{#if c.lure}{lureName(c.lure)}{:else}—{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
