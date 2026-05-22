# Decisions

## Product Boundary

The tool is a config preview and validation playground, not a deployment system. It intentionally stops at editing, validating, saving, loading, and previewing configuration.

## SQLite for Persistence

SQLite keeps the project easy to run locally while still demonstrating real persistence and CRUD behavior.

## Pydantic for Validation

Pydantic gives typed backend validation with clear errors and keeps the schema close to the API boundary.

## Split Raw Text from Parsed Config

The editor keeps raw JSON text separate from the last valid parsed config so syntax errors do not break the live preview.

## Intentional MVP Limits

The project does not include authentication, deployment, public sharing, or version history. Those features are useful, but they are outside the focused portfolio MVP.

## Mobile-Style Preview

The preview uses a mobile product shell because tenant branding, navigation, feature flags, and menu categories are easiest to understand when rendered as a concrete app surface.
