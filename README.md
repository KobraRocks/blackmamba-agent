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

```bash
# Clone the repository
git clone https://github.com/your-org/blackmamba.git
cd blackmamba

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎯 Quick Start

### 1. Analyze Your Project
```bash
npm run agent:analyze
```

### 2. Create a New Feature
```bash
npm run agent:new-feature users
```

### 3. Fix Framework Violations
```bash
npm run agent:fix-violations
```

### 4. View Agent Patterns
```bash
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

### Creating a New Feature
```typescript
// Invoke via Opencode
@blackmamba-master create new feature "todos" with CRUD operations

// Or use CLI
npm run agent:new-feature todos -- --description "Todo management system"
```

### Project Analysis
```typescript
// Get comprehensive project analysis
@blackmamba-master analyze project structure

// Or use CLI
npm run agent:analyze
```

### Framework Compliance Check
```typescript
// Check for framework violations
@blackmamba-master check framework compliance

// Fix violations
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

### Package Scripts
```json
{
  "scripts": {
    "dev": "ts-node src/server.ts",
    "agent": "ts-node src/agents/cli.ts",
    "agent:analyze": "ts-node src/agents/cli.ts analyze",
    "agent:new-feature": "ts-node src/agents/cli.ts new-feature",
    "agent:fix-violations": "ts-node src/agents/cli.ts fix-violations"
  }
}
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