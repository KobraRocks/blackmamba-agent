## ADDED Requirements
### Requirement: Web Designer Agent for CSS and Design
The system SHALL provide a Web Designer Agent specialized in CSS, web design, and UX/UI that follows BlackMamba's specific CSS design philosophy. The agent SHALL ensure consistent application of BlackMamba's design principles across the codebase.

#### Scenario: Creating CSS components with BlackMamba patterns
- **WHEN** developer requests CSS component creation via Opencode
- **THEN** Web Designer Agent analyzes existing CSS structure
- **AND** creates CSS following BlackMamba's single-file approach with configurable variables in `:root{}`
- **AND** implements CSS components over class spamming patterns
- **AND** uses custom tags over generic tags for component styling
- **AND** ensures components look consistent wherever they are loaded

#### Scenario: Maintaining CSS design consistency
- **WHEN** developer requests CSS review or refactoring via Opencode
- **THEN** Web Designer Agent checks for adherence to BlackMamba's CSS philosophy
- **AND** identifies violations of single-file, variable-based approach
- **AND** suggests fixes to convert class spamming to CSS components
- **AND** recommends custom tag usage over generic tags
- **AND** ensures all styling uses the framework's variable system

#### Scenario: Implementing responsive and accessible design
- **WHEN** developer requests responsive design implementation via Opencode
- **THEN** Web Designer Agent analyzes current layout and styling
- **AND** implements responsive patterns using BlackMamba's CSS variable system
- **AND** ensures accessibility compliance within framework constraints
- **AND** maintains consistent design language across breakpoints
- **AND** follows BlackMamba's preference for CSS components over utility classes

#### Scenario: Variable-based theme system implementation
- **WHEN** developer requests theme or styling system via Opencode
- **THEN** Web Designer Agent creates comprehensive `:root{}` variable definitions
- **AND** implements light-dark mode support using CSS custom properties
- **AND** ensures all components reference framework variables
- **AND** maintains separation of concerns between component styling and theme variables
- **AND** follows BlackMamba's pattern of internal component variables referencing global variables