# Controllers

## DamagesController

### POST /api/damages
Creates a new damage record. The client must supply a `Guid` which is echoed back in the response.

## RiskTypesController

Provides CRUD operations for risk types at `/api/RiskTypes`.

`/api/dictionaries/risk-types` exposes the same data as a read-only dictionary endpoint.

## ClaimsController

### POST /api/claims
Creates a new claim. Clients are responsible for generating and supplying the claim `Guid`.
