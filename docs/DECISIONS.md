# Decisions

## SQLite for Persistence

SQLite keeps the project easy to run locally while still demonstrating real persistence and CRUD behavior.

## Pydantic for Validation

Pydantic gives typed backend validation with clear errors and keeps the schema close to the API boundary.

## Split Raw Text from Parsed Config

The editor keeps raw JSON text separate from the last valid parsed config so syntax errors do not break the live preview.

## Intentional MVP Limits

The project does not include authentication, deployment, public sharing, or version history. Those features are useful, but they are outside the focused portfolio MVP.
