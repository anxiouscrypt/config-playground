# Gazelle App Configurator

A white-label mobile app configurator for designing Gazelle-powered merchant apps from structured configuration.

## Problem

Gazelle’s mobile platform needs to support different brands, locations, menus, capabilities, payment readiness, and release metadata without baking every change into a new code path. A plain JSON playground is useful for developers, but a real white-label workflow needs a website where an operator can create a client project, configure the mobile app, preview the result, validate the contract, and export payloads that map back to the mobile/catalog system.

## Solution

This project adapts the original Config Playground into a Gazelle-aligned configurator. It is form-first for normal users, keeps an advanced JSON source view for developers, renders a live mobile app preview, validates the config with FastAPI/Pydantic, and persists drafts in SQLite.

## Demo

Screenshot placeholder: `docs/screenshots/gazelle-app-configurator.png`

## Features

- Client and location setup for white-label app projects
- Brand theme controls mapped to Gazelle-style `appConfig.theme`
- Navigation tabs, feature flags, payment capabilities, and fulfillment controls
- Store operations settings for hours, pickup instructions, prep ETA, and tax
- Menu and home-card preview data
- React Native Web in-page simulator with clickable tabs, menu browsing, cart state, checkout preview, account screen, and config-driven styling
- Advanced JSON editor for direct contract inspection and import
- Server-side validation for color values, capability mirrors, bundle IDs, and location consistency
- Save, list, load, and delete local app projects with SQLite
- Export payload shaped around `appConfig`, `storeConfig`, `menu`, `homeCards`, and build metadata

## Architecture

```txt
Configurator UI
  -> form controls and advanced JSON source
  -> live mobile app preview
  -> FastAPI validation API
  -> Pydantic Gazelle-style builder schema
  -> SQLite draft storage
```

The configurator intentionally stays standalone. It mirrors the important Gazelle mobile contracts without importing the private monorepo package, which keeps this repo easy to run and demo.

## Tech Stack

- React, TypeScript, Vite
- React Native Web preview runtime
- Tailwind CSS
- FastAPI, Pydantic, SQLite
- Pytest

## Local Setup

Prerequisites:

- Node.js 20 or newer
- Python 3.11 or newer

Run both services:

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

The frontend runs at `http://localhost:5173`.
The backend runs at `http://localhost:8000`.

Run services manually:

```bash
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
PYTHONPATH=backend .venv/bin/uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

Run checks:

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests
cd frontend && npm run build
```

## Example Usage

1. Start the backend and frontend.
2. Create or edit a client project.
3. Configure brand, theme, tabs, features, payments, fulfillment, store details, menu data, and release metadata.
4. Use the in-page simulator to switch tabs, add menu items, preview checkout, and inspect account/loyalty states.
5. Validate and save the project.
6. Export the Gazelle-shaped payload for handoff to the mobile/catalog integration.

## API Endpoints

- `GET /health`
- `POST /configs/validate`
- `POST /configs`
- `GET /configs`
- `GET /configs/{config_id}`
- `DELETE /configs/{config_id}`

The endpoint names still use `/configs` for compatibility with the original playground, but the payload is now a `MobileBuilderProject`.

## What I Learned

- A useful white-label builder needs form controls for operators and a raw JSON path for developers.
- Gazelle’s real app boundary is not just branding; it includes app config, store config, menu, home cards, payments, fulfillment, and release metadata.
- Cross-field validation matters because mobile payloads must agree on shared identifiers like `locationId`.

## Future Improvements

See `docs/ROADMAP.md`.
