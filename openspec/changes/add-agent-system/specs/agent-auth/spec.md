## ADDED Requirements
### Requirement: Authentication Agent
The system SHALL provide an Auth Agent that implements authentication and role-based access control (RBAC) following BlackMamba framework patterns.

#### Scenario: Implement user authentication
- **WHEN** developer requests to implement authentication for a feature
- **THEN** Auth Agent creates Passport strategies (local, magic link)
- **AND** implements authentication middleware
- **AND** sets up session management
- **AND** creates user entity with proper security fields
- **AND** implements password hashing and validation

#### Scenario: Implement RBAC system
- **WHEN** developer requests role-based access control
- **THEN** Auth Agent creates role definitions and permissions
- **AND** implements RBAC middleware
- **AND** creates authorization checks for routes and fragments
- **AND** sets up role inheritance and permission hierarchy
- **AND** implements admin interface for role management

### Requirement: Security Pattern Implementation
The system SHALL implement security best practices following BlackMamba conventions.

#### Scenario: Secure authentication flow
- **WHEN** Auth Agent implements authentication
- **THEN** it uses secure password hashing (bcrypt/argon2)
- **AND** implements rate limiting for login attempts
- **AND** sets secure session cookies with proper flags
- **AND** implements CSRF protection
- **AND** adds security headers (CSP, HSTS)

#### Scenario: HTMX-aware authorization
- **WHEN** Auth Agent implements authorization middleware
- **THEN** it provides HTMX-specific error responses
- **AND** handles authentication failures with appropriate fragments
- **AND** implements conditional rendering based on user roles
- **AND** provides seamless login/logout experiences with HTMX