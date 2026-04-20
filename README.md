# OpenFishing

A self-hosted web app to organize your fishing lures.

## Features

- Add, edit, and delete lures
- Fields: name, brand, type, color, weight, size, notes, running depth, water type, weather
- Fish species and tags (chip input)
- Photo upload per lure (file picker or camera capture)
- Filter by type, brand, color, water type, running depth, species (client-side, instant)
- Auto-suggest on text fields based on existing entries
- QR code label generator with print view
- i18n: English and German (browser language auto-detected, switchable via flag picker)

## Tech Stack

- **SvelteKit** — full-stack (UI + server routes)
- **TailwindCSS v4** — styling
- **SQLite** — database via Drizzle ORM + better-sqlite3
- **Docker** — deployment

## Running with Docker

Photos and the database are stored on volume mounts.

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
```

Authentication is handled at the reverse proxy / load balancer level (e.g. nginx or Traefik basic auth). The app itself has no built-in auth.

## Development

```bash
npm install
npm run dev
```

After changing the DB schema:

```bash
npm run db:push
```
