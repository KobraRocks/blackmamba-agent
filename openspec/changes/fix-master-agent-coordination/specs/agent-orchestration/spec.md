## MODIFIED Requirements
### Requirement: Master Agent Development Workflow
The system SHALL provide a master agent that manages development workflow for BlackMamba framework projects. The master agent SHALL be invoked via Opencode, analyze project structure, coordinate specialized subagents running as Opencode tasks, and maintain development context consistency.

#### Scenario: New feature development via Opencode
- **WHEN** developer invokes master agent via Opencode to create feature "user profiles"
- **THEN** master agent analyzes BlackMamba project structure
- **AND** creates git branch `feature/user-profiles` using GitWorkflowManager
- **AND** coordinates development, database, HTMX, and testing agents as Opencode tasks using Task tool
- **AND** ensures all components follow BlackMamba framework conventions
- **AND** creates feedback loop where test failures trigger development agent fixes
- **AND** validates all tests pass before suggesting merge to main

#### Scenario: Development workflow analysis
- **WHEN** developer requests workflow analysis via Opencode
- **THEN** master agent scans project structure within Opencode context
- **AND** identifies development workflow improvements
- **AND** provides actionable recommendations for framework consistency
- **AND** suggests appropriate subagent tasks to execute via Task tool

## ADDED Requirements
### Requirement: Git Branch Enforcement
The master agent SHALL enforce git branch creation before feature development and validate git repository state throughout the workflow.

#### Scenario: Feature development without git branch
- **WHEN** developer requests new feature without git repository
- **THEN** master agent initializes git repository automatically
- **AND** creates feature branch following naming conventions
- **AND** validates branch is clean before proceeding

#### Scenario: Uncommitted changes during workflow
- **WHEN** workflow execution detects uncommitted changes
- **THEN** master agent prompts for commit or stash
- **AND** pauses workflow until git state is clean

### Requirement: Real Agent Coordination
The master agent SHALL invoke specialized subagents using Opencode Task tool with shared context and track execution results.

#### Scenario: Development agent task execution
- **WHEN** master agent coordinates feature development
- **THEN** it invokes @blackmamba-development agent via Task tool
- **AND** passes project context and requirements
- **AND** tracks task completion and results
- **AND** handles task failures with retry logic

#### Scenario: Testing agent feedback loop
- **WHEN** testing agent identifies failures
- **THEN** master agent collects test results
- **AND** invokes development agent with failure details
- **AND** creates iterative fix cycle until tests pass
- **AND** reports final test status before merge

### Requirement: Workflow Status Tracking
The master agent SHALL provide real-time workflow status, next steps, and completion tracking.

#### Scenario: Workflow progress monitoring
- **WHEN** developer requests workflow status
- **THEN** master agent displays current step, completed tasks, and pending actions
- **AND** shows agent invocation results and any errors
- **AND** provides estimated time to completion

#### Scenario: Workflow interruption and resumption
- **WHEN** workflow is interrupted (e.g., agent failure)
- **THEN** master agent saves workflow state
- **AND** allows resumption from last successful step
- **AND** provides recovery options for failed steps