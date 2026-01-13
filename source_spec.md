# OpenSpec: Node.js HTMX Web App Framework

## 1. Project Structure

```
my-app/
├── src/
│   ├── core/                    # Framework-agnostic business logic
│   │   ├── domains/            # Domain models and aggregates
│   │   ├── services/           # Business services (pure TypeScript)
│   │   ├── repositories/       # Data access interfaces
│   │   ├── events/             # Domain events and handlers
│   │   └── errors/             # Domain-specific errors
│   │
│   ├── features/               # Feature-based modules
│   │   ├── auth/
│   │   │   ├── core/           # Auth business logic
│   │   │   ├── components/     # Auth UI components
│   │   │   ├── fragments/      # HTMX fragment handlers
│   │   │   ├── api/           # Auth API endpoints
│   │   │   └── tests/
│   │   │       ├── unit/      # Core logic tests
│   │   │       ├── fragment/  # HTML fragment tests
│   │   │       └── e2e/       # Playwright tests
│   │   │
│   │   ├── users/
│   │   └── ...
│   │
│   ├── infrastructure/         # Framework implementations
│   │   ├── database/
│   │   │   ├── prisma/        # Prisma schema and client
│   │   │   └── repositories/  # Prisma implementations
│   │   ├── auth/
│   │   │   ├── passport/      # Passport strategies
│   │   │   ├── middleware/    # Auth middleware
│   │   │   └── rbac/          # Role-based access control
│   │   ├── http/
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── htmx/          # HTMX-specific handlers
│   │   │   └── sse/           # Server-Sent Events setup
│   │   └── templates/          # Template engine setup
│   │       ├── engine/        # Template rendering engine
│   │       └── components/    # Shared UI components
│   │
│   ├── shared/
│   │   ├── types/             # Shared TypeScript types
│   │   ├── constants/         # Application constants
│   │   ├── utils/             # Shared utilities
│   │   └── layouts/           # Base layouts
│   │
│   └── server.ts              # Express server setup
│
├── public/                     # Static files
│   ├── css/
│   ├── js/                    # HTMX and minimal JS
│   └── assets/
│
├── tests/
│   ├── setup/                 # Test utilities
│   ├── fixtures/              # Test data
│   └── global-e2e/            # Global Playwright tests
│
├── scripts/                   # Development scripts
│   ├── seed.ts               # Database seeding
│   └── dev-server.ts         # Hot-reload setup
│
└── config/                    # Configuration files
    ├── environments/
    └── templates/
```

## 2. Development Workflow Specification

### 2.1 Hot-Reload Setup
```typescript
// scripts/dev-server.ts
import nodemon from 'nodemon';
import { spawn } from 'child_process';

// Watch for changes and restart server
nodemon({
  script: 'src/server.ts',
  ext: 'ts html ejs',
  watch: ['src', 'views'],
  ignore: ['**/*.test.ts', '**/*.spec.ts'],
  exec: 'ts-node --transpile-only',
});

// Regenerate Prisma types on schema change
const prismaWatcher = spawn('prisma', ['generate', '--watch'], {
  stdio: 'inherit',
});
```

### 2.2 Database Seeding
```typescript
// scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/infrastructure/auth/password';

const prisma = new PrismaClient();

async function seed() {
  // Clear existing data
  await prisma.$executeRaw`DELETE FROM users`;
  
  // Create admin user
  const adminHash = await hashPassword('admin123');
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      verified: true,
    },
  });
  
  console.log('✅ Database seeded');
}
```

### 2.3 NPM Scripts
```json
{
  "scripts": {
    "dev": "ts-node scripts/dev-server.ts",
    "build": "tsc && prisma generate",
    "start": "node dist/server.js",
    "seed": "ts-node scripts/seed.ts",
    "test:unit": "jest --testPathPattern='.*\\.test\\.ts$'",
    "test:fragment": "jest --testPathPattern='.*\\.fragment\\.test\\.ts$'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

## 3. Core Architecture Patterns

### 3.1 Framework-Agnostic Core
```typescript
// src/core/services/user-service.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  // ... other methods
}

export class UserService {
  constructor(private readonly repository: UserRepository) {}
  
  async registerUser(dto: CreateUserDto): Promise<Result<User, DomainError>> {
    // Pure business logic, no HTTP context
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      return Result.fail(new EmailAlreadyExistsError(dto.email));
    }
    
    const user = await this.repository.create(dto);
    return Result.ok(user);
  }
}
```

### 3.2 Dependency Injection Container
```typescript
// src/infrastructure/di/container.ts
import { Container } from 'inversify';
import { UserService } from '../../core/services/user-service';
import { PrismaUserRepository } from '../database/repositories/user-repository';

const container = new Container();

// Bind core interfaces to infrastructure implementations
container.bind<UserRepository>('UserRepository')
  .to(PrismaUserRepository)
  .inSingletonScope();

container.bind<UserService>(UserService)
  .toSelf()
  .inSingletonScope();

export { container };
```

## 4. Template Engine Specification

### 4.1 Using EJS with TypeScript Support
```typescript
// src/infrastructure/templates/engine/renderer.ts
import ejs from 'ejs';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface TemplateData {
  title?: string;
  user?: AuthUser;
  errors?: Record<string, string>;
  [key: string]: any;
}

export class TemplateRenderer {
  private componentCache = new Map<string, string>();
  
  async render(template: string, data: TemplateData): Promise<string> {
    return ejs.render(template, {
      ...data,
      component: this.renderComponent.bind(this),
      partial: this.renderPartial.bind(this),
    });
  }
  
  async renderComponent(name: string, props: any): Promise<string> {
    const componentPath = join(__dirname, '../components', `${name}.ejs`);
    const template = this.componentCache.get(componentPath) || 
                     readFileSync(componentPath, 'utf-8');
    
    return this.render(template, props);
  }
}
```

### 4.2 Component Example
```ejs
<%-- src/infrastructure/templates/components/button.ejs --%>
<button 
  class="btn <%= locals.variant || 'primary' %>"
  <%= locals.hxGet ? `hx-get="${locals.hxGet}"` : '' %>
  <%= locals.hxPost ? `hx-post="${locals.hxPost}"` : '' %>
  <%= locals.hxTarget ? `hx-target="${locals.hxTarget}"` : '' %>
>
  <%= locals.text %>
</button>

<%-- Usage in template --%>
<%- component('button', { 
  text: 'Load More', 
  variant: 'secondary',
  hxGet: '/api/items?page=2',
  hxTarget: '#items-container'
}) %>
```

## 5. HTMX Integration Specification

### 5.1 HTMX Middleware
```typescript
// src/infrastructure/http/middleware/htmx.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function htmxMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if request is from HTMX
  res.locals.isHxRequest = req.headers['hx-request'] === 'true';
  res.locals.hxTrigger = req.headers['hx-trigger'];
  res.locals.hxTriggerName = req.headers['hx-trigger-name'];
  res.locals.hxTarget = req.headers['hx-target'];
  
  // Set HTMX response headers helper
  res.hx = {
    trigger: (event: string, detail?: any) => {
      res.setHeader('HX-Trigger', JSON.stringify({ [event]: detail || {} }));
    },
    redirect: (url: string) => {
      res.setHeader('HX-Redirect', url);
    },
    refresh: () => {
      res.setHeader('HX-Refresh', 'true');
    },
  };
  
  next();
}

// Template helper for conditional rendering
export function htmxTemplateHelper() {
  return {
    isHxRequest: (req: Request) => req.headers['hx-request'] === 'true',
    shouldSkipLayout: (req: Request) => 
      req.headers['hx-request'] === 'true' && 
      req.headers['hx-target'] !== 'body',
  };
}
```

### 5.2 Fragment Handler Pattern
```typescript
// src/features/todos/fragments/todo-list.fragment.ts
import { Request, Response } from 'express';
import { TodoService } from '../core/todo-service';
import { container } from '../../../infrastructure/di/container';

export async function getTodoListFragment(req: Request, res: Response) {
  const todoService = container.get(TodoService);
  const todos = await todoService.getUserTodos(req.user!.id);
  
  // For HTMX testing, we return pure HTML
  if (res.locals.isHxRequest) {
    // Return just the fragment without layout
    return res.render('fragments/todo-list', { todos });
  }
  
  // Full page render with layout
  return res.render('pages/todos', { todos });
}
```

## 6. Authentication & Authorization

### 6.1 Passport Configuration
```typescript
// src/infrastructure/auth/passport/strategies.ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as MagicLinkStrategy } from 'passport-magic-link';
import { UserService } from '../../../core/services/user-service';
import { container } from '../../di/container';

const userService = container.get(UserService);

passport.use(new LocalStrategy(
  async (email, password, done) => {
    const result = await userService.authenticate(email, password);
    if (result.isFailure) {
      return done(null, false, { message: result.error.message });
    }
    return done(null, result.value);
  }
));

passport.use(new MagicLinkStrategy(
  {
    secret: process.env.MAGIC_LINK_SECRET!,
    userFields: ['email'],
    tokenField: 'token',
    verifyUserAfterToken: true,
  },
  async (user, done) => {
    const result = await userService.verifyUser(user.email);
    return result.isSuccess ? done(null, result.value) : done(result.error);
  }
));
```

### 6.2 RBAC Middleware
```typescript
// src/infrastructure/auth/rbac/middleware.ts
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      if (res.locals.isHxRequest) {
        return res.status(401).render('fragments/auth/login-form', {
          error: 'Please login to continue',
        });
      }
      return res.redirect('/login');
    }
    
    if (!roles.includes(req.user.role)) {
      if (res.locals.isHxRequest) {
        return res.status(403).render('fragments/error', {
          message: 'Insufficient permissions',
        });
      }
      return res.status(403).render('pages/error', {
        message: 'Insufficient permissions',
      });
    }
    
    next();
  };
};
```

## 7. Testing Strategy

### 7.1 Fragment Testing (HTML Parser)
```typescript
// tests/setup/html-testing.ts
import { JSDOM } from 'jsdom';
import { TemplateRenderer } from '../../src/infrastructure/templates/engine/renderer';

export class FragmentTester {
  constructor(private renderer: TemplateRenderer) {}
  
  async testFragment(
    template: string, 
    data: any, 
    assertions: (dom: JSDOM) => void
  ) {
    const html = await this.renderer.render(template, data);
    const dom = new JSDOM(html);
    
    // Run assertions
    assertions(dom);
    
    // Snapshot testing
    expect(html).toMatchSnapshot();
  }
  
  // Helper to check for HTMX attributes
  static hasHxAttribute(element: Element, attribute: string): boolean {
    return element.hasAttribute(`hx-${attribute}`);
  }
}
```

### 7.2 Playwright Test Structure
```typescript
// src/features/todos/tests/e2e/todo-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Todo CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });
  
  test('should add todo via HTMX', async ({ page }) => {
    const newTodo = 'Buy groceries';
    
    // Fill and submit form via HTMX
    await page.fill('input[name="title"]', newTodo);
    await page.click('button[type="submit"][hx-post]');
    
    // Wait for HTMX response
    await page.waitForSelector(`.todo-item:has-text("${newTodo}")`);
    
    // Verify the todo appears without page reload
    const todoCount = await page.locator('.todo-item').count();
    expect(todoCount).toBeGreaterThan(0);
  });
  
  test('should delete todo via HTMX', async ({ page }) => {
    const deleteButton = page.locator('.todo-item:first-child [hx-delete]');
    await deleteButton.click();
    
    // Wait for removal
    await page.waitForSelector('.todo-item:first-child', { state: 'detached' });
  });
});
```

### 7.3 API Versioning Pattern
```typescript
// src/infrastructure/http/api/versioned-router.ts
import { Router } from 'express';

export function createVersionedRouter() {
  const router = Router();
  
  // API version middleware
  router.use('/v1', (req, res, next) => {
    req.apiVersion = 'v1';
    next();
  });
  
  router.use('/v2', (req, res, next) => {
    req.apiVersion = 'v2';
    next();
  });
  
  return router;
}

// Feature API endpoint
// src/features/todos/api/v1/todos.api.ts
export const todoApiV1 = Router()
  .get('/', async (req, res) => {
    const todos = await todoService.getTodos();
    res.json({
      version: 'v1',
      data: todos,
    });
  })
  .post('/', async (req, res) => {
    const result = await todoService.createTodo(req.body);
    if (result.isFailure) {
      return res.status(400).json({
        error: result.error.code,
        message: result.error.message,
      });
    }
    res.status(201).json(result.value);
  });
```

## 8. Error Handling Specification

### 8.1 Structured Error Codes
```typescript
// src/core/errors/domain-errors.ts
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  // ... other error codes
}

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: any
  ) {
    super(message);
  }
}
```

### 8.2 Error Fragment Rendering
```typescript
// src/infrastructure/http/middleware/error.middleware.ts
export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);
  
  const isHxRequest = req.headers['hx-request'] === 'true';
  const errorData = {
    message: error.message,
    code: error instanceof DomainError ? error.code : 'INTERNAL_ERROR',
    requestId: req.id,
  };
  
  if (isHxRequest) {
    // Return error fragment for HTMX
    return res.status(500).render('fragments/error', errorData);
  }
  
  if (req.path.startsWith('/api/')) {
    // JSON error for API
    return res.status(500).json(errorData);
  }
  
  // Full error page for regular requests
  return res.status(500).render('pages/error', errorData);
}
```

## 9. Server-Sent Events (SSE) Setup

### 9.1 SSE Manager
```typescript
// src/infrastructure/http/sse/sse-manager.ts
export class SSEManager {
  private clients = new Map<string, Response>();
  
  addClient(clientId: string, res: Response) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    
    this.clients.set(clientId, res);
    
    // Send initial connection event
    this.sendToClient(clientId, 'connected', { time: new Date().toISOString() });
    
    // Handle client disconnect
    req.on('close', () => {
      this.clients.delete(clientId);
    });
  }
  
  sendToClient(clientId: string, event: string, data: any) {
    const client = this.clients.get(clientId);
    if (client) {
      client.write(`event: ${event}\n`);
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }
  
  broadcast(event: string, data: any, filter?: (clientId: string) => boolean) {
    for (const [clientId, client] of this.clients.entries()) {
      if (!filter || filter(clientId)) {
        client.write(`event: ${event}\n`);
        client.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    }
  }
}
```

## 10. Performance Optimization

### 10.1 In-Memory Cache
```typescript
// src/infrastructure/cache/memory-cache.ts
export class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key: string, data: any, ttlSeconds: number = 60) {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000),
    });
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}
```

### 10.2 Lazy Loading for HTMX
```ejs
<%-- Example of lazy loading fragment --%>
<div 
  hx-get="/fragments/lazy/content"
  hx-trigger="revealed"
  hx-swap="outerHTML"
>
  <!-- Loading placeholder -->
  <div class="loading">Loading...</div>
</div>
```

## 11. Health Checks & Monitoring

### 11.1 Health Endpoint
```typescript
// src/infrastructure/http/health/health.controller.ts
export const healthRouter = Router()
  .get('/health', async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: await checkDatabaseHealth(),
    };
    
    res.json(health);
  })
  .get('/metrics', (req, res) => {
    // Basic metrics endpoint
    res.json({
      requests: requestCounter,
      errors: errorCounter,
      // ... other metrics
    });
  });
```

## 12. Agent-Friendly Development Patterns

### 12.1 Predictable File Locations
- **Core logic**: `src/features/{feature}/core/`
- **Fragments**: `src/features/{feature}/fragments/`
- **API endpoints**: `src/features/{feature}/api/v{version}/`
- **Components**: `src/features/{feature}/components/` or `src/infrastructure/templates/components/`
- **Tests**: Parallel structure with `/tests/` folders

### 12.2 Clear Interfaces
```typescript
// Every feature should export these interfaces
export interface FeatureModule {
  core: {
    // Domain services
  };
  fragments: {
    // Fragment handlers
  };
  api: {
    // API routers
  };
  components: {
    // UI components
  };
}

// Example usage
import { todoModule } from '../features/todos';
app.use('/fragments/todos', todoModule.fragments.router);
app.use('/api/v1/todos', todoModule.api.v1.router);
```

### 12.3 Agent Context File
```json
// .agent-context.json
{
  "framework": "node-htmx-express",
  "template_engine": "ejs",
  "database": "prisma-sqlite",
  "auth": "passport",
  "patterns": {
    "core_business_logic": "framework-agnostic in /core/",
    "fragment_endpoints": "return HTML only",
    "api_endpoints": "return JSON with versioning",
    "testing": {
      "unit": "core logic only",
      "fragment": "HTML parser with snapshots",
      "e2e": "Playwright per-feature"
    }
  },
  "hot_reload": "nodemon + ts-node",
  "seed_script": "scripts/seed.ts"
}
```

## 13. Development Commands Cheat Sheet

```bash
# Start development server with hot reload
npm run dev

# Run database migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Run unit tests
npm run test:unit

# Run fragment tests
npm run test:fragment

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Start production server
npm start
```

This specification provides:
1. **Clear separation** between framework-agnostic core and infrastructure
2. **Feature-based modularity** for scalability
3. **Comprehensive testing strategy** at all levels
4. **HTMX-first architecture** with SSE support
5. **Agent-friendly patterns** with predictable file structures
6. **Production-ready patterns** with error handling, caching, and monitoring

The framework is designed to be maintainable by both humans and AI agents, with clear boundaries and conventions that make navigation and extension straightforward.
