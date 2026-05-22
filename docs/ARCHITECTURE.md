# Config Playground Architecture

## System Components

- **React frontend** edits JSON configuration, renders validation state, previews app behavior, and manages saved configs.
- **Editor state** stores raw text separately from the last valid parsed config.
- **Preview renderer** turns tenant configuration into a mobile-style product preview.
- **FastAPI backend** owns server-side validation and persistence.
- **Pydantic models** define the accepted tenant config shape.
- **SQLite database** stores named configs for local development.

## Data Flow

```txt
User
  -> React editor
  -> local JSON parsing
  -> last valid config
  -> mobile preview
  -> FastAPI validation and save
  -> SQLite config store
```

1. The user edits raw JSON in the frontend editor.
2. The frontend attempts to parse JSON on every change.
3. Syntax errors are shown immediately without clearing the current preview.
4. The last valid config drives the mobile preview.
5. Save and validate actions call the FastAPI backend.
6. The backend validates with Pydantic and stores valid configs in SQLite.

## API Design

- `GET /health` confirms the backend is reachable.
- `POST /configs/validate` validates a config without saving it.
- `POST /configs` validates and persists a config.
- `GET /configs` lists saved config summaries.
- `GET /configs/{config_id}` returns one saved config.
- `DELETE /configs/{config_id}` deletes a saved config.

## Storage Model

Saved configs are keyed by tenant config ID. The database stores the full config JSON plus timestamps. Keeping the payload as JSON preserves flexibility while Pydantic still enforces the public schema at the API boundary.

```txt
configs
  id TEXT PRIMARY KEY
  name TEXT
  payload TEXT
  created_at TEXT
  updated_at TEXT
```

## Validation Model

The backend validates:

- required brand fields
- hex color strings
- feature flag booleans
- non-empty navigation labels
- menu categories with stable IDs and item names

The frontend performs syntax validation first because it can happen instantly, then relies on the backend for schema-level validation.

## Major Decisions

- Use a text editor instead of a full JSON editor package to keep the MVP dependency-light.
- Keep preview rendering local so changes feel instant.
- Use SQLite so saved configs survive restarts without requiring external services.
- Avoid authentication because this is a local portfolio tool, not a hosted multi-user product.

## Known Limitations

- Local-only MVP.
- No authentication or authorization.
- No config version history.
- No public sharing links.
- No collaborative editing.
