## ADDED Requirements

### Requirement: CLI-001 Project Initialization Command
The CLI SHALL provide an `init` command to scaffold new BlackMamba projects with complete structure, dependencies, and agent system configuration.

#### Scenario: Initialize new project in empty directory
- **WHEN** user runs `blackmamba init` in an empty directory with write permissions
- **THEN** the CLI creates complete project structure
- **AND** generates package.json with all dependencies
- **AND** creates TypeScript configuration
- **AND** sets up agent configurations
- **AND** initializes Git repository
- **AND** installs dependencies via npm
- **AND** displays success message with next steps

#### Scenario: Initialize with skipped Git setup
- **WHEN** user runs `blackmamba init --skip-git` in an empty directory
- **THEN** the CLI creates complete project structure
- **AND** generates all configuration files
- **AND** installs dependencies
- **AND** skips Git repository initialization
- **AND** displays success message noting Git was skipped

#### Scenario: Initialize with skipped dependency installation
- **WHEN** user runs `blackmamba init --skip-install` in an empty directory
- **THEN** the CLI creates complete project structure
- **AND** generates all configuration files including package.json
- **AND** skips npm dependency installation
- **AND** displays instructions for manual installation
- **AND** notes that `npm install` should be run manually

#### Scenario: Initialize in non-empty directory
- **WHEN** user runs `blackmamba init` in a directory with existing files
- **THEN** the CLI detects existing files
- **AND** displays warning about non-empty directory
- **AND** prompts for confirmation or suggests using different directory
- **AND** aborts if user declines confirmation

#### Scenario: Handle initialization errors
- **WHEN** initialization fails due to error conditions (disk full, permissions, network)
- **THEN** the CLI displays clear error message describing the issue
- **AND** suggests remediation steps if possible
- **AND** cleans up any partially created files
- **AND** exits with appropriate error code

### Requirement: CLI-002 Project Structure Validation
The initialization process SHALL validate that created structure matches framework specifications and is functional.

#### Scenario: Validate generated project structure
- **WHEN** a project is newly initialized
- **THEN** the system verifies all directories from `source_spec.md` exist
- **AND** checks that package.json has required scripts and dependencies
- **AND** validates tsconfig.json enables strict TypeScript
- **AND** confirms agent config files reference correct agent types
- **AND** verifies server.ts compiles without errors
- **AND** reports any structural violations

#### Scenario: Detect missing critical files
- **WHEN** a project is missing essential files
- **THEN** the system identifies missing files (package.json, tsconfig.json, server.ts)
- **AND** provides specific error messages for each missing file
- **AND** suggests remediation steps
- **AND** marks validation as failed

### Requirement: CLI-003 Template System for Configuration Files
The CLI SHALL use templates to generate configuration files that follow current best practices and project standards.

#### Scenario: Render package.json template
- **WHEN** project initialization runs
- **THEN** the system renders package.json.ejs template with project-specific values
- **AND** generates valid package.json with dependencies
- **AND** includes all required scripts (dev, build, test, etc.)
- **AND** sets proper package name and version
- **AND** creates file with correct JSON formatting

#### Scenario: Render agent configuration templates
- **WHEN** project initialization runs
- **THEN** the system copies all agent config templates to `.opencode/agent/`
- **AND** ensures configs reference correct agent types
- **AND** includes framework-specific instructions
- **AND** sets proper permissions on config files

#### Scenario: Handle template rendering errors
- **WHEN** template rendering fails due to malformed template or missing variable
- **THEN** the system catches rendering errors
- **AND** displays helpful error message indicating which template failed
- **AND** suggests checking template syntax
- **AND** aborts initialization with clear failure message

### Requirement: CLI-004 Dependency Management During Initialization
The CLI SHALL handle dependency installation with proper error handling and user feedback.

#### Scenario: Successful dependency installation
- **WHEN** dependency installation runs with valid package.json and network connectivity
- **THEN** the system shows progress indicator
- **AND** displays npm output (optional verbose mode)
- **AND** verifies node_modules directory created
- **AND** checks critical packages installed
- **AND** reports success with installation summary

#### Scenario: Handle network failure during installation
- **WHEN** npm install fails due to network connectivity issues
- **THEN** the system detects npm failure
- **AND** offers retry option
- **AND** if retry fails, provides manual installation instructions
- **AND** notes which dependencies failed
- **AND** suggests checking network or npm registry

#### Scenario: Skip dependency installation
- **WHEN** user specified `--skip-install` flag
- **THEN** the system skips npm install entirely
- **AND** generates package.json and package-lock.json
- **AND** displays clear instructions for manual installation
- **AND** notes that project won't run without dependencies

### Requirement: CLI-005 Git Repository Setup
The CLI SHALL initialize Git repository with proper configuration and initial commit.

#### Scenario: Initialize Git repository
- **WHEN** Git initialization runs with git installed and user configured
- **THEN** the system runs `git init` in project directory
- **AND** creates .gitignore with Node.js/TypeScript patterns
- **AND** stages all created files
- **AND** creates initial commit with descriptive message
- **AND** reports Git repository created successfully

#### Scenario: Handle missing git installation
- **WHEN** Git initialization is attempted but git is not installed
- **THEN** the system detects git command failure
- **AND** displays warning that git is not installed
- **AND** creates .gitignore file anyway for future use
- **AND** suggests installing git and running `git init` manually
- **AND** continues with other initialization steps

#### Scenario: Skip Git initialization
- **WHEN** user specified `--skip-git` flag
- **THEN** the system skips all Git operations
- **AND** still creates .gitignore file
- **AND** displays note that Git was skipped
- **AND** suggests running `git init` manually when ready

### Requirement: CLI-006 User Feedback and Progress Reporting
The CLI SHALL provide clear, real-time feedback during initialization process.

#### Scenario: Display initialization progress
- **WHEN** initialization process starts
- **THEN** the CLI displays step name with status indicator
- **AND** shows progress percentage if applicable
- **AND** uses consistent formatting (✅ for success, ❌ for failure)
- **AND** updates progress in real-time
- **AND** provides brief description of current operation

#### Scenario: Display completion summary
- **WHEN** initialization completes successfully
- **THEN** the CLI displays success banner
- **AND** lists key actions performed
- **AND** shows next steps for user
- **AND** provides commands to verify installation
- **AND** includes troubleshooting tips

#### Scenario: Handle verbose output mode
- **WHEN** user requests verbose output
- **THEN** the CLI shows detailed output for each operation
- **AND** displays command execution details
- **AND** logs file creation details
- **AND** shows template rendering details
- **AND** includes debugging information