# Change: Add Agent System for BlackMamba Framework

## Why
The BlackMamba framework provides a comprehensive Node.js/HTMX web application structure, but development requires deep knowledge of multiple domains (HTMX fragments, core business logic, database operations, testing strategies). A specialized agent system will accelerate development by providing expert guidance and automation for each domain while maintaining framework conventions.

## What Changes
- **ADDED** Master Agent that manages development workflow and coordinates specialized subagents
- **ADDED** Development Agent for core business logic and feature implementation
- **ADDED** HTMX Agent for fragment creation and HTMX pattern implementation
- **ADDED** Database Agent for Prisma schema and repository operations
- **ADDED** Testing Agent for unit, fragment, and E2E test generation
- **ADDED** Auth Agent for authentication and RBAC implementation
- **ADDED** API Agent for API endpoint implementation and versioning
- **ADDED** Git branch workflow for feature development, bug fixes, and spec implementation
- **ADDED** Opencode integration where master agent is invoked via Opencode and subagents run within Opencode
- **ADDED** Workflow coordination system that maintains BlackMamba framework consistency

## Impact
- Affected specs: agent-orchestration, agent-development, agent-testing, agent-database, agent-htmx, agent-auth, agent-api
- Affected code: New `/agents/` directory with agent implementations integrated into existing BlackMamba structure
- Git workflow: Automatic branch creation for features, specs, and bug fixes with validation before merge
- Opencode integration: Master agent invoked via Opencode commands, subagents run as Opencode tasks
- Development workflow: Agents work within existing framework patterns to maintain consistency