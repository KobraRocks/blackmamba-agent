# Design: Agent System for BlackMamba Framework

## Context
BlackMamba is a Node.js/HTMX web application framework with clear architectural patterns (framework-agnostic core, feature-based modules, HTMX fragments). Development requires expertise in multiple domains simultaneously. This agent system provides specialized assistance for each domain while maintaining framework conventions.

## Goals / Non-Goals

### Goals
- Provide expert guidance for each framework domain (HTMX, core logic, database, testing)
- Maintain BlackMamba framework conventions and patterns automatically
- Enable rapid feature development with consistent quality within existing structure
- Integrate with Opencode where master agent is invoked via Opencode and subagents run as Opencode tasks
- Share context between agents to maintain project coherence and workflow consistency

### Non-Goals
- Replace human developers entirely
- Support frameworks other than BlackMamba
- Handle runtime application orchestration (focus on development workflow only)
- Implement complex AI reasoning (start with rule-based, pattern-matching agents)
- Create standalone CLI tools (agents run within Opencode ecosystem)

## Decisions

### Decision: Hierarchical Agent Architecture
**What**: Master agent coordinates specialized subagents, each focused on one domain
**Why**: 
- Clear separation of concerns
- Each agent can be optimized for its domain
- Easier to test and maintain
- Parallel development of agents

**Alternatives considered**:
- Single monolithic agent: Would be too complex and hard to maintain
- Peer-to-peer agents: Harder to coordinate and ensure consistency

### Decision: Opencode Integration
**What**: Master agent invoked via Opencode commands, subagents run as Opencode tasks
**Why**:
- Leverages existing Opencode infrastructure and tooling
- Consistent developer experience within Opencode ecosystem
- Built-in task management and coordination
- No need for separate CLI tool development

**Alternatives considered**:
- Standalone CLI: Would duplicate Opencode functionality
- Web interface: Overkill for development tools
- Direct API calls: Less discoverable for developers

### Decision: Context Sharing via Project Analysis
**What**: Agents analyze BlackMamba project structure to understand context and maintain framework conventions
**Why**:
- Ensures agents work within existing BlackMamba patterns
- Reduces configuration burden
- Enables intelligent suggestions based on project state
- Maintains consistency with framework structure

**Alternatives considered**:
- Configuration files: Additional maintenance burden
- No context: Would require manual specification for every operation
- Generic patterns: Would not maintain BlackMamba-specific conventions

### Decision: Rule-Based with Pattern Matching
**What**: Start with rule-based agents using pattern matching and templates
**Why**:
- Predictable behavior
- Easier to debug and maintain
- No external dependencies for core functionality
- Can be enhanced later with AI if needed

**Alternatives considered**:
- AI-first approach: Unpredictable, requires external APIs, harder to debug

## Risks / Trade-offs

### Risk: Agent Complexity
**Mitigation**: Start with simple, focused agents. Add complexity only when proven necessary.

### Risk: Framework Coupling
**Mitigation**: Design agent interfaces to work specifically with BlackMamba patterns. Embrace framework coupling as a feature to ensure consistency.

### Risk: Performance Overhead
**Mitigation**: Agents run during development only, not in production. Optimize file operations and caching.

## Migration Plan
1. Implement agents as optional tools
2. Provide migration guides for existing projects
3. Phase implementation: Master agent first, then subagents
4. Gather feedback and iterate

## Open Questions
- Should agents be able to learn from project patterns over time?
- How to handle agent conflicts or contradictory suggestions?
- What level of undo/rollback capability is needed?
- How to best expose agent commands through Opencode interface?