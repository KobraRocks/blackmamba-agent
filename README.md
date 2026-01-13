# 🐍 BlackMamba

**Node.js HTMX Web App Framework with Intelligent Agent System**

BlackMamba is a modern web application framework that combines the simplicity of HTMX with the power of TypeScript and an intelligent agent system for accelerated development.

## 🚀 Features

### Framework Architecture
- **Framework-agnostic core** - Business logic separated from infrastructure
- **Feature-based modules** - Self-contained features with clear boundaries
- **HTMX-first UI** - Server-rendered components with seamless interactivity
- **Repository pattern** - Clean data access with dependency injection
- **Comprehensive testing** - Unit, fragment, and E2E testing strategy

### Intelligent Agent System
- **Master Agent** - Orchestrates development workflow and coordinates specialized agents
- **Development Agent** - Creates framework-agnostic business logic and features
- **HTMX Agent** - Builds HTMX fragments, components, and interactive patterns
- **Database Agent** - Manages Prisma schema, migrations, and repositories
- **Testing Agent** - Generates comprehensive tests at all levels

## 📦 Installation

### Development Installation
```bash
# Clone the repository
git clone https://github.com/your-org/blackmamba.git
cd blackmamba

# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

### Global CLI Installation (Arch Linux)
Make the `blackmamba-agent` CLI available globally:

```bash
# From the project directory
cd blackmamba

# Install globally using npm link
sudo npm link

# Verify installation
blackmamba-agent --help

# Or install globally without linking
sudo npm install -g .

# Alternative: Create a symlink manually
sudo ln -s $(pwd)/dist/agents/cli.js /usr/local/bin/blackmamba-agent
```

### Global CLI Installation (Other Systems)
```bash
# Install globally
npm install -g .

# Or from a published package (when available)
# npm install -g blackmamba-agent
```

## 🎯 Quick Start

### Using Global CLI (Recommended)
If you've installed BlackMamba globally:

```bash
# Create and initialize a new project
mkdir my-app
cd my-app
blackmamba-agent init --name "my-app" --description "My BlackMamba Application"

# With custom options
blackmamba-agent init --skip-install --skip-git --verbose
```

### Using NPM Scripts (Development)
If you're working from the BlackMamba source directory:

```bash
# Create a new directory for your project
mkdir my-app
cd my-app

# Initialize BlackMamba project
npm run agent:init -- --name "my-app" --description "My BlackMamba Application"

# Or with custom options
npm run agent:init -- --skip-install --skip-git --verbose
```

### 2. Analyze Your Project
```bash
# Using Global CLI
blackmamba-agent analyze

# Using NPM Scripts (from source)
npm run agent:analyze
```

### 3. Create a New Feature
```bash
# Using Global CLI
blackmamba-agent new-feature users

# Using NPM Scripts (from source)
npm run agent:new-feature users
```

### 4. Fix Framework Violations
```bash
# Using Global CLI
blackmamba-agent fix-violations

# Using NPM Scripts (from source)
npm run agent:fix-violations
```

### 5. View Agent Patterns
```bash
# Using Global CLI
blackmamba-agent patterns

# Using NPM Scripts (from source)
npm run agent:patterns
```

## 🏗️ Project Structure

```
blackmamba/
├── src/
│   ├── core/                    # Framework-agnostic business logic
│   ├── features/               # Feature-based modules
│   │   ├── {feature}/
│   │   │   ├── core/           # Feature business logic
│   │   │   ├── fragments/      # HTMX fragment handlers
│   │   │   ├── api/           # API endpoints
│   │   │   └── components/     # UI components
│   ├── infrastructure/         # Framework implementations
│   ├── shared/                 # Shared utilities and types
│   └── agents/                 # Agent system
│       ├── master/            # Master agent orchestration
│       ├── development/       # Business logic agent
│       ├── htmx/             # HTMX agent
│       ├── database/         # Database agent
│       ├── testing/          # Testing agent
│       └── shared/           # Shared agent utilities
├── .opencode/agent/           # Opencode agent configurations
└── openspec/                  # Specification-driven development
```

## 🤖 Agent System

### Master Agent (`@blackmamba-master`)
- **Purpose**: Development workflow orchestration
- **Capabilities**: Project analysis, agent coordination, framework compliance
- **Invocation**: `@blackmamba-master create new feature "users"`

### Development Agent (`@blackmamba-development`)
- **Purpose**: Core business logic implementation
- **Capabilities**: Domain services, feature modules, dependency injection
- **Patterns**: Result pattern, repository interfaces, domain errors

### HTMX Agent (`@blackmamba-htmx`)
- **Purpose**: HTMX fragment and component development
- **Capabilities**: Fragment handlers, reusable components, HTMX patterns
- **Patterns**: Conditional rendering, lazy loading, SSE integration

### Database Agent (`@blackmamba-database`)
- **Purpose**: Prisma schema and repository operations
- **Capabilities**: Schema management, migrations, repository implementations
- **Patterns**: Repository pattern, transaction safety, query optimization

### Testing Agent (`@blackmamba-testing`)
- **Purpose**: Comprehensive test generation
- **Capabilities**: Unit tests, fragment tests, E2E tests
- **Patterns**: HTML parsing, snapshot testing, Playwright integration

## 📖 Usage Examples

### Project Initialization
**Using Global CLI:**
```bash
# Initialize a new BlackMamba project
blackmamba-agent init --name "my-app" --description "My Application"

# Initialize with custom options
blackmamba-agent init \
  --name "my-app" \
  --description "My BlackMamba Application" \
  --skip-git \
  --skip-install \
  --verbose
```

**Using NPM Scripts (from source):**
```bash
npm run agent:init -- --name "my-app" --description "My Application"

npm run agent:init -- \
  --name "my-app" \
  --description "My BlackMamba Application" \
  --skip-git \
  --skip-install \
  --verbose
```

**Options:**
- `--skip-git` - Skip Git repository initialization
- `--skip-install` - Skip npm dependency installation  
- `--verbose` - Show detailed output
- `--name <name>` - Project name (default: my-blackmamba-app)
- `--description <desc>` - Project description

### Creating a New Feature
```typescript
// Invoke via Opencode
@blackmamba-master create new feature "todos" with CRUD operations

// Or use CLI (Global)
blackmamba-agent new-feature todos --description "Todo management system"

// Or use NPM Scripts (from source)
npm run agent:new-feature todos -- --description "Todo management system"
```

### Project Analysis
```typescript
// Get comprehensive project analysis
@blackmamba-master analyze project structure

// Or use CLI (Global)
blackmamba-agent analyze

// Or use NPM Scripts (from source)
npm run agent:analyze
```

### Framework Compliance Check
```typescript
// Check for framework violations
@blackmamba-master check framework compliance

// Fix violations (Global CLI)
blackmamba-agent fix-violations

// Or use NPM Scripts (from source)
npm run agent:fix-violations
```

## 🔧 Configuration

### Opencode Integration
Agents are configured in `.opencode/agent/` directory:

```markdown
# .opencode/agent/blackmamba-master.md
---
description: Master agent for BlackMamba framework
mode: subagent
tools:
  write: true
  edit: true
  bash: true
  task: true
---
```

### Package Scripts (Source Development)
When working from the BlackMamba source directory:

```json
{
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc && npm run copy-templates",
    "start": "node dist/server.js",
    "agent": "ts-node src/agents/cli.ts",
    "agent:analyze": "ts-node src/agents/cli.ts analyze",
    "agent:new-feature": "ts-node src/agents/cli.ts new-feature",
    "agent:fix-violations": "ts-node src/agents/cli.ts fix-violations",
    "agent:workflows": "ts-node src/agents/cli.ts workflows",
    "agent:patterns": "ts-node src/agents/cli.ts patterns",
    "agent:git-status": "ts-node src/agents/cli.ts git-status",
    "agent:create-branch": "ts-node src/agents/cli.ts create-branch",
    "agent:validate-merge": "ts-node src/agents/cli.ts validate-merge",
    "agent:init": "ts-node src/agents/cli.ts init",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```

### Global CLI Commands
When installed globally, use `blackmamba-agent`:

```bash
# Project Management
blackmamba-agent init [options]           # Initialize new project
blackmamba-agent analyze                  # Analyze project structure
blackmamba-agent new-feature <name>       # Create new feature
blackmamba-agent fix-violations           # Fix framework violations
blackmamba-agent patterns                 # Show framework patterns

# Git Workflow
blackmamba-agent git-status               # Check git workflow status
blackmamba-agent create-branch <type> <name>  # Create development branch
blackmamba-agent validate-merge           # Validate branch for merge

# Development
blackmamba-agent workflows                # List executed workflows
blackmamba-agent --help                   # Show all commands
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit      # Unit tests
npm run test:fragment  # Fragment tests
npm run test:e2e       # E2E tests
```

## 📚 Documentation

- [Framework Patterns](docs/patterns.md)
- [Agent System Guide](docs/agents.md)
- [API Reference](docs/api.md)
- [Migration Guide](docs/migration.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [HTMX](https://htmx.org/) for the hypermedia approach
- [Opencode](https://opencode.ai/) for the agent infrastructure
- [Prisma](https://www.prisma.io/) for database tooling
- All contributors and users of the framework

---

Built with ❤️ by the BlackMamba team.