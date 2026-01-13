# Design: `blackmamba init` Command

## Architecture Overview

The `blackmamba init` command will extend the existing CLI infrastructure in `src/agents/cli.ts` with a new command that performs comprehensive project initialization.

## Components

### 1. CLI Command Handler
- **Location**: `src/agents/cli.ts` (extend existing Commander.js setup)
- **Responsibility**: Parse command-line options and delegate to initialization service
- **Options**:
  - `--skip-git`: Skip Git repository initialization
  - `--skip-install`: Skip npm dependency installation
  - `--template <name>`: Use specific template (future enhancement)

### 2. Project Initialization Service
- **Location**: `src/agents/services/project-initializer.ts`
- **Responsibility**: Orchestrate all initialization steps
- **Methods**:
  - `initializeProject(options)`: Main entry point
  - `createDirectoryStructure()`: Create folders from `source_spec.md`
  - `createPackageJson()`: Generate package.json with dependencies
  - `createConfigurationFiles()`: Create config files
  - `initializeGit()`: Set up Git repository
  - `installDependencies()`: Run npm install

### 3. Template System
- **Location**: `src/agents/templates/`
- **Responsibility**: Provide template files for scaffolding
- **Structure**:
  - `templates/package.json.ejs`: Package.json template
  - `templates/tsconfig.json.ejs`: TypeScript config
  - `templates/.gitignore.ejs`: Git ignore file
  - `templates/.env.example.ejs`: Environment variables
  - `templates/agent-configs/`: Agent configuration files

### 4. File System Operations
- **Location**: `src/agents/utils/file-system.ts`
- **Responsibility**: Safe file and directory operations
- **Features**:
  - Check for existing files (avoid overwrites)
  - Create directories with proper permissions
  - Write files with error handling
  - Validate directory is empty/writable

## Data Flow

1. **User runs** `blackmamba init` in target directory
2. **CLI validates** directory is empty/writable
3. **Initializer creates** directory structure from `source_spec.md`
4. **Templates generate** configuration files
5. **Git repository** initialized (unless skipped)
6. **Dependencies installed** (unless skipped)
7. **Success message** with next steps displayed

## Directory Structure Creation

Based on `source_spec.md`, the following structure will be created:

```
my-app/
├── src/
│   ├── core/
│   │   ├── domains/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── events/
│   │   └── errors/
│   ├── features/
│   │   └── auth/ (basic auth feature)
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── auth/
│   │   ├── http/
│   │   └── templates/
│   ├── shared/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── layouts/
│   └── server.ts
├── public/
│   ├── css/
│   ├── js/
│   └── assets/
├── tests/
│   ├── setup/
│   ├── fixtures/
│   └── global-e2e/
├── scripts/
│   ├── seed.ts
│   └── dev-server.ts
├── config/
│   ├── environments/
│   └── templates/
├── .opencode/
│   └── agent/ (agent configurations)
└── openspec/ (specification files)
```

## Configuration Files

### package.json
- Based on current project's package.json
- Includes all required dependencies
- Scripts for development, testing, building
- Proper TypeScript configuration

### TypeScript Config (tsconfig.json)
- Strict TypeScript settings
- Path aliases for project structure
- Proper module resolution

### Environment Files
- `.env.example`: Template with required variables
- `.gitignore`: Proper ignores for Node.js/TypeScript projects

### Agent Configurations
- `.opencode/agent/blackmamba-master.md`: Master agent config
- `.opencode/agent/blackmamba-development.md`: Development agent
- `.opencode/agent/blackmamba-htmx.md`: HTMX agent
- `.opencode/agent/blackmamba-database.md`: Database agent
- `.opencode/agent/blackmamba-testing.md`: Testing agent

## Error Handling

### Validation Errors
- Directory not empty (unless force flag)
- Insufficient permissions
- Node.js version incompatible
- Network issues (dependency installation)

### Recovery Strategies
- Partial rollback on failure
- Clear error messages with remediation steps
- Log file for debugging initialization issues

## Security Considerations

### File Permissions
- Set appropriate permissions for created files
- Avoid world-writable directories

### Dependency Security
- Use exact versions for critical dependencies
- Include security audit in post-install check

### Environment Variables
- Never commit sensitive data
- Provide `.env.example` template only

## Performance Considerations

### Dependency Installation
- Use npm ci for reproducible installs
- Cache node_modules if possible
- Parallel operations where safe

### File Operations
- Batch file writes
- Use streaming for large templates
- Validate disk space before starting

## Testing Strategy

### Unit Tests
- Test individual initialization components
- Mock file system operations
- Test error conditions

### Integration Tests
- Full initialization in temporary directory
- Verify all files created correctly
- Test with different options

### E2E Tests
- Run actual `blackmamba init` command
- Verify project can start and run basic operations

## Future Enhancements

### Template Variants
- Basic template (minimal setup)
- Full template (with example features)
- Custom templates (user-provided)

### Interactive Mode
- Prompt for project name, description
- Select features to include
- Configure database options

### Plugin System
- Allow plugins to extend initialization
- Third-party template support
- Post-init hooks for custom setup