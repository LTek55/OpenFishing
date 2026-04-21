<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { t, catches } = data;

	function formatDate(d: Date) {
		return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
	}
	function formatTime(d: Date) {
		return new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div>
	{#if catches.length === 0}
		<div style="text-align:center; padding:80px 24px;">
			<div style="display:inline-flex; align-items:center; justify-content:center; width:80px; height:80px; border-radius:50%; background:#0b1a2c; border:1px solid #172f4a; margin-bottom:20px;">
				<svg width="38" height="38" viewBox="0 0 24 24" fill="none" style="color:#2d5270;">
					<path d="M2 12 C4 8 7 6 10 7 C13 8 14 11 17 11 C20 11 22 9 22 9 C22 9 21 14 18 15 C15 16 13 14 10 14 C7 14 4 16 2 12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="rgba(6,182,212,0.06)"/>
					<path d="M22 9 L20 6 M22 9 L20 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					<circle cx="7" cy="11" r="1.2" fill="currentColor" opacity="0.5"/>
				</svg>
			</div>
			<p style="font-family:'Carter One',sans-serif; font-size:1.1rem; color:#8ab8cc; margin:0 0 8px;">{t.catchNoItems}</p>
			<p style="font-size:0.875rem; color:#3d6a84; margin:0 0 24px;">{t.catchNoItemsHint}</p>
			<a href="/catches/new"
				style="display:inline-flex; align-items:center; gap:7px; background:#06b6d4; color:#030a12; font-size:0.875rem; font-weight:700; padding:10px 22px; border-radius:9px; text-decoration:none; font-family:'DM Sans',sans-serif;"
			>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
				{t.addCatch}
			</a>
		</div>
	{:else}
		<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px;">
			{#each catches as c}
				<a href="/catches/{c.id}" style="text-decoration:none; display:block; background:#0b1a2c; border:1px solid #172f4a; border-radius:16px; overflow:hidden; transition:border-color 0.15s, box-shadow 0.15s;"
					onmouseenter={function(e){(e.currentTarget as HTMLElement).style.borderColor='rgba(6,182,212,0.3)'; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(6,182,212,0.08)';}}
					onmouseleave={function(e){(e.currentTarget as HTMLElement).style.borderColor='#172f4a'; (e.currentTarget as HTMLElement).style.boxShadow='';}}
				>
					<!-- Thumbnail -->
					{#if c.photos.length > 0}
						<div style="aspect-ratio:16/9; overflow:hidden; background:#0d1f35;">
							<img src="/uploads/{c.photos[0].filename}" alt={c.species ?? ''} style="width:100%; height:100%; object-fit:cover;" />
						</div>
					{:else}
						<div style="aspect-ratio:16/9; background:#0d1f35; display:flex; align-items:center; justify-content:center;">
							<svg width="44" height="44" viewBox="0 0 24 24" fill="none" style="color:#1d3d5c;">
								<path d="M2 12 C4 8 7 6 10 7 C13 8 14 11 17 11 C20 11 22 9 22 9 C22 9 21 14 18 15 C15 16 13 14 10 14 C7 14 4 16 2 12Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="rgba(6,182,212,0.06)"/>
								<path d="M22 9 L20 6 M22 9 L20 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
								<circle cx="7" cy="11" r="1" fill="currentColor" opacity="0.4"/>
							</svg>
						</div>
					{/if}

					<!-- Info -->
					<div style="padding:14px 16px;">
						<div style="display:flex; align-items:baseline; justify-content:space-between; gap:8px; margin-bottom:4px;">
							<p style="font-family:'Carter One',sans-serif; font-size:1rem; color:#e0eaf8; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{c.species ?? '—'}</p>
							<span style="font-family:'JetBrains Mono',monospace; font-size:0.68rem; color:#3d6a84; white-space:nowrap; flex-shrink:0;">{formatTime(c.caughtAt)}</span>
						</div>
						<p style="font-size:0.75rem; color:#5d8fa8; margin:0 0 10px;">{formatDate(c.caughtAt)}</p>

						{#if c.weightG || c.lengthCm}
							<div style="display:flex; gap:6px; margin-bottom:8px;">
								{#if c.weightG}
									<span style="font-size:0.72rem; font-weight:600; color:#22d3ee; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.2); padding:2px 8px; border-radius:20px;">{c.weightG}g</span>
								{/if}
								{#if c.lengthCm}
									<span style="font-size:0.72rem; font-weight:600; color:#22d3ee; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.2); padding:2px 8px; border-radius:20px;">{c.lengthCm}cm</span>
								{/if}
							</div>
						{/if}

						{#if c.lure}
							<div style="display:flex; gap:5px; flex-wrap:wrap;">
								<span style="font-size:0.7rem; font-weight:500; color:#5d8fa8; background:rgba(93,143,168,0.1); border:1px solid rgba(93,143,168,0.2); padding:2px 8px; border-radius:20px; display:inline-flex; align-items:center; gap:4px;">
									<svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M4 20 Q8 16 12 14 Q16 12 20 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="8" r="2" fill="currentColor"/></svg>
									{c.lure.name}
								</span>
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
