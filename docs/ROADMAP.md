# Roadmap

## Completed MVP

- Gazelle-aligned builder document
- Client and location setup controls
- Theme, tabs, feature flags, payments, fulfillment, and store capability controls
- Store operations controls
- Seeded menu and home-card editing
- Live mobile preview
- Advanced JSON editor/import path
- FastAPI validation and SQLite persistence
- Backend tests for validation and CRUD behavior
- README and architecture documentation

## Near-Term Improvements

- Add real add/remove/reorder controls for menu categories, menu items, and home cards.
- Rename backend routes from `/configs` to `/projects` while keeping compatibility aliases.
- Add draft version history and diffing.
- Export separate files for `app-config.json`, `store-config.json`, `menu.json`, `home-cards.json`, and `build-profile.json`.
- Add screenshot capture for demo docs.

## Gazelle Integration Path

- Import TypeScript types or generated JSON Schema from `@lattelink/contracts-catalog`.
- Add an adapter for Gazelle admin APIs:
  - create client
  - create/update location
  - update capabilities
  - update store config
  - update menu/home cards
- Add auth and scoped user projects.
- Add asset upload flow for icons, splash images, and menu item photos.
- Add launch readiness checks that mirror Gazelle onboarding and mobile release status.

## Later Product Features

- Multi-location brand support.
- Theme preset library.
- App preview mode switching for Home/Menu/Orders/Account.
- Public preview links for merchant review.
- Approval workflow before publishing changes to production.
