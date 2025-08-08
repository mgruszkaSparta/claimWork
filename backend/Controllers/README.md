# Controllers

## DamagesController

### POST /api/damages/init
Creates and returns a new `Guid` for a damage record without persisting it.

### POST /api/damages
Persists a new damage using the id from the init endpoint and the submitted details.
