<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { t, spots } = data;
</script>

<div>
	{#if spots.length === 0}
		<!-- Empty state -->
		<div style="text-align:center; padding:80px 24px;">
			<div style="display:inline-flex; align-items:center; justify-content:center; width:80px; height:80px; border-radius:50%; background:#0b1a2c; border:1px solid #172f4a; margin-bottom:20px;">
				<svg width="36" height="36" viewBox="0 0 24 24" fill="none" style="color:#2d5270;">
					<path d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z" stroke="currentColor" stroke-width="1.5" fill="rgba(6,182,212,0.06)"/>
					<circle cx="12" cy="8" r="2.5" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			</div>
			<p style="font-family:'Carter One',sans-serif; font-size:1.1rem; color:#8ab8cc; margin:0 0 8px;">{t.spotNoSpots}</p>
			<p style="font-size:0.875rem; color:#3d6a84; margin:0 0 24px;">{t.spotNoSpotsHint}</p>
			<a href="/spots/new"
				style="display:inline-flex; align-items:center; gap:7px; background:#06b6d4; color:#030a12; font-size:0.875rem; font-weight:700; padding:10px 22px; border-radius:9px; text-decoration:none; font-family:'DM Sans',sans-serif;"
			>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
				{t.addSpot}
			</a>
		</div>
	{:else}
		<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px;">
			{#each spots as s}
				<a href="/spots/{s.id}" style="text-decoration:none; display:block; background:#0b1a2c; border:1px solid #172f4a; border-radius:16px; overflow:hidden; transition:border-color 0.15s, box-shadow 0.15s;"
					onmouseenter={function(e){(e.currentTarget as HTMLElement).style.borderColor='rgba(6,182,212,0.3)'; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(6,182,212,0.08)';}}
					onmouseleave={function(e){(e.currentTarget as HTMLElement).style.borderColor='#172f4a'; (e.currentTarget as HTMLElement).style.boxShadow='';}}
				>
					<!-- Thumbnail -->
					{#if s.photos.length > 0}
						<div style="aspect-ratio:16/9; overflow:hidden; background:#0d1f35;">
							<img src="/uploads/{s.photos[0].filename}" alt={s.name} style="width:100%; height:100%; object-fit:cover;" />
						</div>
					{:else}
						<div style="aspect-ratio:16/9; background:#0d1f35; display:flex; align-items:center; justify-content:center;">
							<svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="color:#1d3d5c;">
								<path d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z" stroke="currentColor" stroke-width="1.4" fill="rgba(6,182,212,0.06)"/>
								<circle cx="12" cy="8" r="2.5" stroke="currentColor" stroke-width="1.4"/>
							</svg>
						</div>
					{/if}

					<!-- Info -->
					<div style="padding:14px 16px;">
						<p style="font-family:'Carter One',sans-serif; font-size:1rem; color:#e0eaf8; margin:0 0 4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{s.name}</p>
						<p style="font-family:'JetBrains Mono',monospace; font-size:0.7rem; color:#3d6a84; margin:0 0 10px;">
							{s.lat.toFixed(5)}, {s.lng.toFixed(5)}
						</p>
						{#if s.tags.length > 0}
							<div style="display:flex; flex-wrap:wrap; gap:5px;">
								{#each s.tags as tag}
									<span style="font-size:0.7rem; font-weight:600; color:#5d8fa8; background:rgba(93,143,168,0.1); border:1px solid rgba(93,143,168,0.2); padding:2px 8px; border-radius:20px;">{tag.name}</span>
								{/each}
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
