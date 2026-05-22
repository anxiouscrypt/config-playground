# Build Log

## Phase 1: Original Config Playground

- Created the base React, FastAPI, SQLite project.
- Added JSON editing, live preview, backend validation, local persistence, docs, and tests.
- Proved the basic idea: configuration can drive a previewable app surface.

## Phase 2: Gazelle Research

- Reviewed the Gazelle mobile platform and catalog contracts.
- Identified the important runtime payloads: `appConfig`, `storeConfig`, `menu`, and `homeCards`.
- Noted existing Gazelle constraints around single-tenant mobile builds, baked-in brand/location IDs, and the need to avoid fallback content leaking across merchants.
- Reviewed admin-console planning around clients, locations, capabilities, onboarding, and release readiness.

## Phase 3: Configurator Rebuild

- Replaced the generic tenant sample with a Gazelle-style `MobileBuilderProject`.
- Added form-first sections for client setup, theme, capabilities, store operations, menu data, home cards, and release metadata.
- Kept an advanced JSON view for contract inspection and import.
- Rebuilt the mobile preview around Gazelle mobile concepts: home cards, visible menu items, tabs, feature flags, payment support, store state, and brand theme.

## Phase 4: Backend Contract Upgrade

- Replaced the old simple tenant Pydantic schema with Gazelle-style builder models.
- Added validation for color values, bundle IDs, fulfillment timing, capability mirrors, and shared `locationId` consistency.
- Kept the existing CRUD API surface while changing the payload to the richer builder project.

## Phase 5: Verification

- Updated backend fixtures and tests for the new schema.
- Added validation coverage for cross-payload location mismatch.
- Confirmed backend tests pass.
- Confirmed the frontend production build passes.

## Phase 6: In-Page Simulator Runtime

- Replaced the static phone preview with a standalone mobile runtime simulator.
- Added clickable Home, Menu, Orders, and Account screens inside the page.
- Added simulator cart state, menu item add/remove behavior, checkout preview, preview order placement, account profile, loyalty display, and payment capability chips.
- Kept the simulator local to the configurator instead of using Expo Snack so real-time config changes remain immediate and self-contained.

## Phase 7: React Native Web Runtime

- Added `react-native-web` to render the simulator from React Native primitives instead of hand-authored DOM markup.
- Aliased `react-native` to `react-native-web` in Vite.
- Ported the simulator shell to `View`, `Text`, `Pressable`, `ScrollView`, `Image`, and `StyleSheet`.
- Matched the Gazelle mobile app’s base Home/Menu/Orders/Account layout patterns more closely while keeping the project standalone.
