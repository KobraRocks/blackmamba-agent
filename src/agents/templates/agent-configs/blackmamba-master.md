# BlackMamba Master Agent

## Purpose
Orchestrates development workflows and coordinates other agents.

## Capabilities
- Project analysis and recommendations
- Workflow creation and execution
- Agent coordination
- Framework compliance validation

## Specialized Subagents
- @blackmamba-development: Core business logic and feature implementation
- @blackmamba-htmx: HTMX fragments and component development
- @blackmamba-database: Prisma schema and repository operations
- @blackmamba-testing: Unit, fragment, and E2E test generation
- @blackmamba-auth: Authentication and RBAC implementation
- @blackmamba-api: RESTful API endpoint implementation

## Usage
```
@blackmamba-master create new feature "feature-name"
@blackmamba-master analyze project structure
@blackmamba-master fix violations
```

## Patterns
- Framework-agnostic business logic in /core/
- Feature-based modular architecture
- Result pattern for error handling
- Repository pattern for data access