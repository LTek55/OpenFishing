# OpenFishing

A self-hosted web app to organize your fishing lures, mark fishing spots, and log your catches.

## Features

### Lures
- Add, edit, and delete lures with full metadata: name, brand, type, color, weight, size, running depth, water type, light conditions, fish species, notes
- Photo uploads per lure (file picker or camera capture)
- Tag support via chip input
- Mark lures as favourites (heart icon on card)
- Sequential lure numbers (`#0001`) for easy reference
- Include/exclude chip filters: type, running depth, light conditions, fish species, favourites — client-side, instant
- Light conditions stored as integer 0–10 (Night → Clear) with labeled slider in the form
- Auto-suggest on text fields and fish species chips based on existing entries
- QR code label generator with compact print view (12.5×12.5mm labels)

### Spots
- Add fishing spots by clicking on an interactive map or using GPS auto-locate
- Photo gallery per spot (multiple uploads, sortable)
- Tags and free-text notes
- Get Directions link (Google Maps)
- View nearby catches on the spot detail page (Haversine distance < 100m)

### Catches
- Log catches with species, length, weight, date/time, notes, and photos
- Record retrieve style per catch: Steady Retrieve, Stop & Go, Jigging, Ripping, and more
- Place exact catch location on an interactive map (GPS auto-locate on mobile)
- Cross-reference the lure used
- Automatically linked to the nearest defined spot within 100m
- Catch detail page shows linked lure, spot, and retrieve style

### Stats
- Trophy bar: total catches, species count, spots fished, C&R rate
- Personal bests per species (max length + weight, clickable links to catch record)
- Top lures by catch count with C&R breakdown
- Top retrieve styles bar chart
- Monthly activity (last 12 months), time-of-day histogram, day-of-week breakdown
- Top spots by catch count

### General
- i18n: English and German (auto-detected from browser, switchable via flag picker)
- Optional built-in password authentication via `AUTH_PASSWORD` env var

## Tech Stack

- **SvelteKit** — full-stack (UI + server routes)
- **TailwindCSS v4** — styling
- **SQLite** — database via Drizzle ORM + better-sqlite3
- **Leaflet.js** — interactive maps
- **Docker** — deployment via `ghcr.io/m1ndgames/openfishing:latest`

## Running with Docker

```yaml
services:
  openfishing:
    image: ghcr.io/m1ndgames/openfishing:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      - DATABASE_URL=/app/data/openfishing.db
      - UPLOAD_PATH=/app/uploads
      - BASE_URL=https://fishing.yourdomain.com
      - AUTH_PASSWORD=your_secure_password
```

If `AUTH_PASSWORD` is not set, authentication is disabled and the app is fully open. When set, any unauthenticated request is redirected to a login page. The session is stored in an `httpOnly` cookie and remains valid for 1 year; changing the password immediately invalidates all existing sessions.

## Development

```bash
npm install
npm run dev
```

After changing the DB schema, generate and apply migrations:

```bash
npm run db:generate   # requires interactive TTY
npm run db:migrate
```
