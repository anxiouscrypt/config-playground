# Architecture

## System Components

- **React configurator** provides form-first controls for client identity, brand theme, capabilities, store operations, menu content, home cards, and release metadata.
- **Advanced JSON source view** keeps the developer workflow from the original playground and allows direct inspection/import of the full project payload.
- **Mobile runtime simulator** turns the builder project into an interactive in-page app with Home, Menu, Orders, and Account screens, cart state, checkout preview, loyalty/account views, and config-driven styling.
- **FastAPI backend** validates and persists app projects.
- **Pydantic models** mirror the important Gazelle mobile/catalog contracts: `appConfig`, `storeConfig`, `menu`, `homeCards`, and build metadata.
- **SQLite database** stores local drafts as JSON payloads keyed by project ID.

## Data Flow

```txt
User
  -> Configurator controls
  -> MobileBuilderProject state
  -> Interactive mobile runtime simulator
  -> FastAPI validation
  -> SQLite draft store
  -> Exported Gazelle-shaped payload
```

The frontend treats the builder project as the source of truth. Form edits update the structured object and regenerate the JSON source. JSON edits parse back into the project when they match the expected shape.

## Builder Document

The saved project wraps the runtime payloads needed by a white-label mobile app:

- `client`: account and owner information for the merchant.
- `appConfig`: brand, theme, tabs, feature flags, payments, fulfillment, and store capabilities.
- `storeConfig`: hours, open state, prep ETA, tax rate, and pickup instructions.
- `menu`: catalog categories and visible menu items.
- `homeCards`: home screen promotional/content cards.
- `build`: app name, bundle ID, icon, splash image, and release channel.
- `publish`: local draft/validation state.

## API Design

- `GET /health` confirms the backend is reachable.
- `POST /configs/validate` validates a project without saving it.
- `POST /configs` validates and persists a project.
- `GET /configs` lists saved project summaries.
- `GET /configs/{config_id}` returns one saved project.
- `DELETE /configs/{config_id}` deletes a project.

The current route prefix remains `/configs` so the original app integration stays simple. A hosted product version should probably expose `/projects` and scoped authenticated routes.

## Storage Model

```txt
configs
  id TEXT PRIMARY KEY
  brand_name TEXT NOT NULL
  payload TEXT NOT NULL
  created_at TEXT NOT NULL
  updated_at TEXT NOT NULL
```

SQLite stores the full JSON payload to keep the builder flexible while Pydantic owns the public validation contract.

## Validation Model

The backend validates:

- required client, brand, location, store, menu, and build fields
- theme color values
- enabled tabs from the supported mobile tab set
- bundle ID format
- fulfillment schedule ordering
- capability mirror fields such as loyalty/order tracking/staff dashboard
- matching `locationId` across `appConfig`, `storeConfig`, `menu`, and `homeCards`
- matching client name and app brand name

## Relationship To Gazelle

This repo was researched against the Gazelle mobile platform contracts and catalog defaults. It does not import the private package directly. Instead, it mirrors the contract shape closely enough to prove the configurator workflow and keep the project standalone.

## Known Limitations

- No real authentication yet.
- No direct write-back to the Gazelle catalog/admin APIs.
- No asset upload pipeline for icons, splash images, or menu item photos.
- No version history or approval workflow.
- The simulator is a standalone web runtime, not a native Expo/iOS/Android runtime.
- The menu editor only edits the seeded sample rows; a production builder needs add/remove/reorder controls.
