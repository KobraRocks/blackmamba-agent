## MODIFIED Requirements
### Requirement: Master Agent Development Workflow
The system SHALL provide a master agent that manages development workflow for BlackMamba framework projects. The master agent SHALL be invoked via Opencode, analyze project structure, coordinate specialized subagents running as Opencode tasks, and maintain development context consistency.

#### Scenario: New feature development via Opencode
- **WHEN** developer invokes master agent via Opencode to create feature "user profiles"
- **THEN** master agent analyzes BlackMamba project structure
- **AND** identifies required components (core logic, fragments, API, tests, styling)
- **AND** coordinates development, database, HTMX, testing, and web designer agents as Opencode tasks
- **AND** ensures all components follow BlackMamba framework conventions

#### Scenario: Development workflow analysis
- **WHEN** developer requests workflow analysis via Opencode
- **THEN** master agent scans project structure within Opencode context
- **AND** identifies development workflow improvements
- **AND** provides actionable recommendations for framework consistency
- **AND** suggests appropriate subagent tasks to execute

#### Scenario: CSS and design workflow coordination
- **WHEN** developer requests styling or design implementation via Opencode
- **THEN** master agent coordinates with Web Designer Agent for CSS implementation
- **AND** ensures styling follows BlackMamba's CSS design philosophy
- **AND** maintains consistency between HTMX fragments and CSS components
- **AND** validates that all styling uses the framework's variable system