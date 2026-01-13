# agent-testing Specification

## Purpose
TBD - created by archiving change add-agent-system. Update Purpose after archive.
## Requirements
### Requirement: Comprehensive Test Generation
The system SHALL provide a testing agent that creates and maintains tests at all levels (unit, fragment, E2E) following BlackMamba testing strategy.

#### Scenario: Create unit tests for service
- **WHEN** development agent creates new service
- **THEN** testing agent creates corresponding unit tests
- **AND** tests business logic in isolation
- **AND** mocks dependencies appropriately
- **AND** follows Result pattern testing

#### Scenario: Create fragment tests
- **WHEN** HTMX agent creates new fragment
- **THEN** testing agent creates fragment tests
- **AND** uses HTML parser for assertions
- **AND** tests HTMX attributes and behavior
- **AND** creates snapshot tests

### Requirement: E2E Test Automation
The system SHALL provide Playwright E2E test generation and maintenance.

#### Scenario: Create E2E test for feature
- **WHEN** new feature is implemented
- **THEN** testing agent creates Playwright tests
- **AND** tests user flows with HTMX interactions
- **AND** includes authentication scenarios
- **AND** follows Page Object Model pattern

#### Scenario: Test maintenance
- **WHEN** code changes break tests
- **THEN** testing agent suggests fixes
- **AND** updates snapshots when appropriate
- **AND** maintains test data consistency
- **AND** ensures tests remain reliable

