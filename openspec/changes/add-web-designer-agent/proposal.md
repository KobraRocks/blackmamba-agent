# Change: Add Web Designer Agent for BlackMamba Framework

## Why
BlackMamba framework has a specific CSS design philosophy that prefers single CSS files with configurable variables in `:root{}`, CSS components over class spamming like Tailwind, and custom tags over generic tags. Currently, there's no specialized agent to ensure consistent application of these design principles across the codebase. A Web Designer Agent will provide expert guidance in CSS, web design, and UX/UI while maintaining BlackMamba's unique design patterns.

## What Changes
- **ADDED** Web Designer Agent specialized in CSS, web design, and UX/UI
- **ADDED** Agent follows BlackMamba's CSS design philosophy: single CSS files, configurable variables, CSS components over class spamming, custom tags over generic tags
- **ADDED** Agent ensures consistent styling across components using BlackMamba's variable system
- **ADDED** Agent provides expert guidance on responsive design, accessibility, and modern CSS features
- **ADDED** Integration with existing agent orchestration system

## Impact
- Affected specs: agent-orchestration (modified), agent-web-designer (added)
- Affected code: New agent implementation in `/agents/` directory
- Development workflow: Web Designer Agent available via Opencode for CSS and design tasks
- Framework consistency: Ensures all styling follows BlackMamba's design principles