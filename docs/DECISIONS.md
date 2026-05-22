# Decisions

## Pivot From Generic Config Playground

The original project proved config-driven previewing. The Gazelle use case needs a configurator that maps to a real white-label mobile app lifecycle, so the primary UI is now form-first and the JSON editor is an advanced escape hatch.

## Mirror Gazelle Contracts Without Importing Them

The project mirrors Gazelle concepts like `appConfig`, `storeConfig`, `menu`, `homeCards`, capabilities, fulfillment, and release metadata. It does not import the private monorepo contracts because this repo should remain standalone, public, and easy to run.

## Keep `/configs` Routes For Now

The backend still exposes `/configs` to preserve the original integration and minimize churn. A production hosted builder should rename this boundary to `/projects` and introduce authenticated user/project ownership.

## SQLite For Draft Persistence

SQLite is enough for local demos and keeps setup simple. The payload is stored as JSON so the builder can evolve without migrations for every contract field, while Pydantic still validates on save.

## Cross-Field Validation

The backend validates more than field presence. It checks that `locationId` is consistent across runtime payloads and that capability mirrors agree with feature flags. This catches the kinds of mistakes that would otherwise create confusing mobile behavior.

## Form Controls Plus Advanced JSON

Operators need forms. Developers need to see the contract. Keeping both surfaces makes the tool useful for product setup and engineering handoff.

## Intentional MVP Limits

This is not a full SaaS builder yet. It does not include auth, asset upload, app-store submission, direct Gazelle API writes, or an approval workflow. Those are important but would obscure the core configurator workflow in this iteration.
