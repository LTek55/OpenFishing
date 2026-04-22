# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OpenFishing** is a self-hosted SvelteKit + SQLite web app for organizing fishing lures, marking fishing spots, and logging catches.

No in-app authentication — auth is delegated to the reverse proxy / load balancer (e.g. nginx or Traefik basic auth).

## Tech Stack

- **SvelteKit** — full-stack (UI + server routes, no separate backend)
- **TailwindCSS v4** — styling (no config file, imported via `@tailwindcss/vite`)
- **Drizzle ORM** — database via `better-sqlite3`
- **Leaflet.js** — interactive maps (dynamic import inside `onMount`)
- **Docker** — deployment; `ghcr.io/m1ndgames/openfishing:latest` built via GitHub Actions on push to `main`

## Commands

```bash
npm install            # Install dependencies
npm run dev            # Start dev server
npm run build          # Build for production
npm run preview        # Preview production build
npm run check          # Svelte type-check

npm run db:push        # Push schema changes to SQLite (dev, use --force in CI)
npm run db:generate    # Generate migration files
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio (DB GUI)
```

## Schema changes — mandatory workflow

**Always** follow these steps when changing `schema.ts`. Skipping any step breaks production migrations.

1. Edit `src/lib/server/db/schema.ts`
2. Run `npm run db:generate` in a real terminal (requires TTY — cannot run via Claude Code's bash tool)
   - Drizzle will prompt about renames vs. drop+add — answer accordingly
   - This creates: `drizzle/NNNN_<name>.sql` + `drizzle/meta/NNNN_snapshot.json` + updates `drizzle/meta/_journal.json`
3. Commit **all three** generated/updated files together with the schema change
4. Update all server files that reference the old column name

**Never** manually write migration SQL files — the journal and snapshot won't be updated, and `migrate()` will silently skip the migration on prod startup.

## Architecture

### Routes

| Route | Purpose |
|---|---|
| `/` | Lure grid with client-side filters and pagination |
| `/lures/new` | Add lure form |
| `/lures/[id]` | Lure detail view |
| `/lures/[id]/edit` | Edit / delete lure |
| `/spots` | Spot list |
| `/spots/new` | Add spot form (map + GPS) |
| `/spots/[id]` | Spot detail view (map, photos, nearby catches table) |
| `/spots/[id]/edit` | Edit / delete spot |
| `/catches` | Catch list |
| `/catches/new` | Add catch form (map + GPS) |
| `/catches/[id]` | Catch detail view (map, photos, lure + spot links) |
| `/catches/[id]/edit` | Edit / delete catch |
| `/settings/qr` | Print QR labels for unlabeled lures |
| `/uploads/[filename]` | Serve uploaded photos from `UPLOAD_PATH` |
| `/api/lang` | POST — sets `lang` cookie for i18n |

### Data model

- `lure` — id (UUID), lureNumber (sequential int), name, brand, type, color, weight, size, notes, photoPath, species, runningDepth, waterType, weather, lightConditions, qrCoded, createdAt, updatedAt
- `tag` — id, lureId (FK → lure, cascade delete), name
- `spot` — id (UUID), name, lat, lng, notes, createdAt, updatedAt
- `spotTag` — id, spotId (FK → spot, cascade delete), name
- `spotPhoto` — id, spotId (FK → spot, cascade delete), filename, sortOrder
- `fishCatch` — id (UUID), caughtAt, species, weightG, lengthCm, lat (nullable), lng (nullable), notes, catchAndRelease, presentation, lureId (FK → lure, set null on delete), createdAt, updatedAt
- `catchPhoto` — id, catchId (FK → fishCatch, cascade delete), filename, sortOrder

Tags are stored in separate tag tables (one row per tag). Species is stored as a space-separated string in `lure.species`. Both use the `TagInput` chip component at `src/lib/components/TagInput.svelte`.

`lureNumber` is a sequential display number (shown as `#0001`). The primary key is a UUID used in URLs.

### Spot ↔ Catch relationship

Spots and catches are **not** linked by a foreign key. Instead, the relationship is computed at query time using the Haversine formula:

- For each catch with lat/lng, find the nearest spot.
- If the nearest spot is **this** spot **and** the distance is < 100m, the catch is shown on the spot detail page.
- On the catch detail page, the nearest spot within 100m is shown as a link.

This approach avoids storing a redundant FK while still supporting the "no spot defined yet" case gracefully.

### Navigation

The layout (`src/routes/+layout.svelte`) has two bars:
- **Main nav**: Logo + section buttons (Lures, Spots, Catches) with active state + language switcher (far right)
- **Sub nav**: Contextual action buttons (Add Lure / Add Spot / Add Catch depending on section) + QR Codes

The language switcher is a `<select>` with flag emoji in the options (`🇬🇧 EN` / `🇩🇪 DE`), posting to `/api/lang`.

### i18n

Translations live in `src/lib/i18n/en.ts` and `src/lib/i18n/de.ts`. The layout server (`src/routes/+layout.server.ts`) reads the `lang` cookie (falling back to `Accept-Language` header) and returns `{ t, lang }`, which SvelteKit merges into every page's `data` prop automatically.

### File uploads

Photos are saved to `UPLOAD_PATH` (env var, defaults to `./uploads`) and served through the `/uploads/[filename]` server route. Images are auto-rotated and resized to max 1920×1920 JPEG via `sharp`. The filename stored in the DB is just the basename (UUID + `.jpg`). Must be a Docker volume in production.

### Leaflet maps

Leaflet is always dynamically imported inside `onMount` (`const L = (await import('leaflet')).default`). The map element (`bind:this={mapEl}`) must have only a static `style="height:Xpx;"` — never reactive styles on the same element, as Svelte mutating the element Leaflet tracks causes tile offset corruption. Wrap it in a parent div if border/radius styling is needed.

Always call `requestAnimationFrame(() => mapInstance.invalidateSize())` after `setView` to fix tile rendering when the element was not visible at mount time.

### Select / dropdown styling

All `<select>` elements use `appearance: none` (with `-webkit-` and `-moz-` prefixes) defined globally in `src/routes/layout.css` with a custom SVG chevron via `background-image`. The `!important` flags are required because inline `background` shorthand on individual selects would otherwise reset `background-image` to none.

Filter selects (lures overview, catches page) must use the same visual style as form selects: `font-size:0.875rem`, `padding:7px 12px`, `border-radius:9px`, `background:#0f2238`. Active (filtered) state: `border:1px solid rgba(6,182,212,0.5); color:#22d3ee`. Inactive: `border:1px solid #243f5e; color:#c2dce8`.

Filter bars use `flex-wrap:wrap` (not `overflow-x:auto`) so they reflow to multiple rows on mobile instead of scrolling horizontally.

### Filtering & pagination

The overview page (`/`) loads all lures once from the server and filters client-side using Svelte 5 `$derived`. Filters: text search, type, brand, color, water type, running depth, fish species. Pagination state (page, pageSize) is also client-side. Do not move filtering to the server.

### Auto-suggest

The new/edit lure forms load distinct existing values for `name`, `brand`, `type`, and `color` from the DB and wire them to `<datalist>` elements.

### QR labels

`/settings/qr` shows all lures where `qrCoded = false`, with a server-side generated SVG QR code per lure. The print view uses `@media print` CSS to render a compact grid of 12.5mm×12.5mm QR codes with bordered frames. Marking a lure as labeled uses a SvelteKit form action with `enhance` (no page reload).

### Migrations

Drizzle migrations run automatically on startup in production (`NODE_ENV=production`). Multi-statement `.sql` migration files must use `-->statement-breakpoint` as a separator (required by `better-sqlite3`).

## Configuration

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `local.db` | Path to SQLite file |
| `UPLOAD_PATH` | `./uploads` | Directory for lure/spot/catch photos |
| `BASE_URL` | `http://localhost:5173` | Public base URL — used to generate QR code links |
| `BODY_SIZE_LIMIT` | `104857600` | Max upload size in bytes (set in Dockerfile) |
