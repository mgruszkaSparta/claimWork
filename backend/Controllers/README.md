# Controllers

## DamagesController

### POST /api/damages/init
Creates and returns a new `Guid` for a damage record without persisting it.

### POST /api/damages
Persists a new damage using the id from the init endpoint and the submitted details.

## RiskTypesController

Provides CRUD operations for risk types at `/api/RiskTypes`.

`/api/dictionaries/risk-types` exposes the same data as a read-only dictionary endpoint.

## ClaimsController

### POST /api/claims/initialize
Generates and returns a new `Guid` for a claim without persisting it. Use the returned id when creating a claim via `POST /api/claims`.
