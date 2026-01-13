# agent-orchestration Specification

## Purpose
TBD - created by archiving change add-agent-system. Update Purpose after archive.
## Requirements
### Requirement: Master Agent Development Workflow
The system SHALL provide a master agent that manages development workflow for BlackMamba framework projects. The master agent SHALL be invoked via Opencode, analyze project structure, coordinate specialized subagents running as Opencode tasks, and maintain development context consistency.

#### Scenario: New feature development via Opencode
- **WHEN** developer invokes master agent via Opencode to create feature "user profiles"
- **THEN** master agent analyzes BlackMamba project structure
- **AND** identifies required components (core logic, fragments, API, tests)
- **AND** coordinates development, database, HTMX, and testing agents as Opencode tasks
- **AND** ensures all components follow BlackMamba framework conventions

#### Scenario: Development workflow analysis
- **WHEN** developer requests workflow analysis via Opencode
- **THEN** master agent scans project structure within Opencode context
- **AND** identifies development workflow improvements
- **AND** provides actionable recommendations for framework consistency
- **AND** suggests appropriate subagent tasks to execute

### Requirement: Opencode-integrated Agent Context
The system SHALL maintain shared development context between agents within Opencode environment, including BlackMamba project structure, framework conventions, and current development workflow state.

#### Scenario: Context sharing via Opencode tasks
- **WHEN** development agent creates a new domain service as Opencode task
- **THEN** database agent receives context about new entity requirements
- **AND** testing agent knows to create corresponding tests
- **AND** HTMX agent knows to create appropriate fragments
- **AND** all agents maintain BlackMamba framework consistency

#### Scenario: Framework convention enforcement
- **WHEN** any agent creates or modifies code within Opencode
- **THEN** it follows BlackMamba framework patterns and directory structure
- **AND** maintains separation between core and infrastructure
- **AND** places files in correct BlackMamba directory structure
- **AND** uses appropriate templates and patterns for the framework

