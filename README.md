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

Detailed setup instructions will be added as the MVP is completed.

## API Endpoints

- `GET /health`
- `POST /configs/validate`
- `POST /configs`
- `GET /configs`
- `GET /configs/{config_id}`
- `DELETE /configs/{config_id}`

## What I Learned

Build notes will be captured in `docs/BUILD_LOG.md`.

## Future Improvements

See `docs/ROADMAP.md`.
