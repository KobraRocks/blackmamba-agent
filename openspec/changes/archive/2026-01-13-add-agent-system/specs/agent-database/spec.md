## ADDED Requirements
### Requirement: Database Schema Management
The system SHALL provide a database agent that manages Prisma schema, migrations, and repository implementations.

#### Scenario: Create new entity
- **WHEN** developer requests to create "Product" entity
- **THEN** database agent updates Prisma schema
- **AND** generates migration
- **AND** creates repository implementation
- **AND** updates dependency injection bindings
- **AND** regenerates Prisma client

#### Scenario: Add relationships
- **WHEN** developer requests relationship between "User" and "Order"
- **THEN** database agent updates schema with proper relations
- **AND** creates migration
- **AND** updates affected repositories
- **AND** handles cascade rules appropriately

### Requirement: Repository Pattern Implementation
The system SHALL implement proper repository pattern following BlackMamba conventions.

#### Scenario: Create repository implementation
- **WHEN** new entity is added to schema
- **THEN** database agent creates Prisma repository
- **AND** implements core repository interface
- **AND** adds to dependency injection container
- **AND** creates proper TypeScript types

#### Scenario: Database operations
- **WHEN** database agent performs operations
- **THEN** it follows transaction patterns when needed
- **AND** implements proper error handling
- **AND** includes query optimization considerations
- **AND** maintains separation from business logic