# Change: Add `blackmamba init` CLI Command

## Why
Users need a quick way to start new BlackMamba projects that follows all framework patterns without manual setup. Currently, users must manually copy templates or follow complex setup instructions, creating friction for new users and reducing adoption of the framework's agent system.

## What Changes
- Add `blackmamba init` command to scaffold new projects
- Create complete directory structure per `source_spec.md`
- Generate all required configuration files
- Set up agent system with `.opencode/agent/` configurations
- Initialize Git repository with proper `.gitignore`
- Install all required dependencies
- Provide clear progress feedback and success message

## Impact
- Affected specs: cli-init (new capability)
- Affected code: `src/agents/cli.ts`, new `src/agents/services/project-initializer.ts`, new `src/agents/templates/` directory
- Users can quickly start new projects with full framework setup
- Improved developer experience and framework adoption