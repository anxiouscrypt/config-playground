# Config Playground

A live configuration playground for editing JSON app settings and previewing multi-tenant product behavior without redeploying code.

## Problem

Multi-tenant products often need tenant-specific branding, feature flags, navigation, and content. Hardcoding those differences makes changes slow and risky. This tool gives developers and operators a safe place to validate configuration before shipping it.

## Solution

Config Playground pairs a JSON editor with a live app preview. Developers can change a tenant config, see the product surface update immediately, validate the config against a backend schema, and save known-good versions locally.

## Demo

Screenshot placeholder: `docs/screenshots/config-playground.png`

## Features

- Split-screen JSON editor and live mobile-style preview
- Client-side syntax feedback
- Server-side schema validation
- Save, list, load, and delete named configs
- SQLite persistence for local development

## Architecture

The React frontend keeps raw editor text and the last valid parsed config separate. The FastAPI backend validates configs with Pydantic and stores saved configs in SQLite.

```txt
React editor -> live preview
      |
      v
FastAPI validation -> SQLite config store
```

## Tech Stack

- React, TypeScript, Vite
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

Run the services manually:

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
2. Edit the JSON config on the left.
3. Watch the mobile preview update from the last valid config.
4. Save the config to SQLite.
5. Load or delete saved configs from the sidebar.

## API Endpoints

- `GET /health`
- `POST /configs/validate`
- `POST /configs`
- `GET /configs`
- `GET /configs/{config_id}`
- `DELETE /configs/{config_id}`

## What I Learned

- Keeping raw editor text separate from validated state prevents broken JSON from breaking the preview.
- Pydantic is a good fit for making config contracts explicit at the API boundary.
- Small developer tools need strong empty states and error messages because the workflow is often exploratory.

## Future Improvements

See `docs/ROADMAP.md`.
