# Architecture

## System Components

- React frontend for editing JSON configuration, previewing UI behavior, and managing saved configs.
- FastAPI backend for validation and persistence.
- Pydantic models for schema enforcement.
- SQLite database for local saved configuration storage.

## Data Flow

1. The user edits raw JSON in the frontend.
2. The frontend parses syntax locally and preserves the last valid config.
3. The preview renders from the last valid config.
4. The backend validates configs before saving.
5. SQLite stores named configs by ID.

## API Design

The API exposes health, validation, and config CRUD endpoints. Full endpoint details are maintained in the README.

## Storage Model

Saved configs are stored as JSON payloads keyed by config ID. Metadata such as update timestamps can be added without changing the public config shape.

## Known Limitations

- Local-only MVP.
- No authentication or authorization.
- No config version history.
- No public sharing links.
