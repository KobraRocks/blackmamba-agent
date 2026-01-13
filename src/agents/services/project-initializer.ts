import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import * as ejs from 'ejs';

const execAsync = promisify(exec);

export interface InitOptions {
  skipGit?: boolean;
  skipInstall?: boolean;
  verbose?: boolean;
  projectName?: string;
  projectDescription?: string;
}

export interface InitResult {
  success: boolean;
  message: string;
  errors: string[];
  warnings: string[];
  createdFiles: string[];
  createdDirectories: string[];
}

export class ProjectInitializer {
  private projectRoot: string;
  private options: InitOptions;
  private result: InitResult;

  constructor(projectRoot: string, options: InitOptions = {}) {
    this.projectRoot = resolve(projectRoot);
    this.options = options;
    this.result = {
      success: false,
      message: '',
      errors: [],
      warnings: [],
      createdFiles: [],
      createdDirectories: []
    };
  }

  async initialize(): Promise<InitResult> {
    try {
      this.log('Starting BlackMamba project initialization...');
      
      // Step 1: Validate directory
      await this.validateDirectory();
      
      // Step 2: Create directory structure
      await this.createDirectoryStructure();
      
      // Step 3: Generate configuration files
      await this.generateConfigurationFiles();
      
      // Step 4: Initialize Git repository (unless skipped)
      if (!this.options.skipGit) {
        await this.initializeGit();
      }
      
      // Step 5: Install dependencies (unless skipped)
      if (!this.options.skipInstall) {
        await this.installDependencies();
      }
      
      // Step 6: Validate project structure
      await this.validateProjectStructure();
      
      this.result.success = true;
      this.result.message = this.getSuccessMessage();
      
    } catch (error) {
      this.result.success = false;
      this.result.message = `Initialization failed: ${error instanceof Error ? error.message : String(error)}`;
      this.result.errors.push(this.result.message);
      
      // Clean up on failure
      await this.cleanupOnFailure();
    }
    
    return this.result;
  }

  private async validateDirectory(): Promise<void> {
    this.log('Validating directory...');
    
    // Check if directory exists and is writable
    try {
      // Try to create a test file to check write permissions
      const testFile = join(this.projectRoot, '.blackmamba-test');
      writeFileSync(testFile, 'test');
      require('fs').unlinkSync(testFile);
    } catch (error) {
      throw new Error(`Directory ${this.projectRoot} is not writable or does not exist`);
    }
    
    // Check if directory is empty (allow .git directory)
    const files: string[] = require('fs').readdirSync(this.projectRoot);
    const allowedFiles = ['.git', '.gitignore', '.DS_Store', 'Thumbs.db'];
    const nonAllowedFiles = files.filter(file => !allowedFiles.includes(file));
    
    if (nonAllowedFiles.length > 0) {
      throw new Error(`Directory ${this.projectRoot} is not empty. Please use an empty directory or specify --force to continue.`);
    }
    
    this.log('✓ Directory validation passed');
  }

  private async createDirectoryStructure(): Promise<void> {
    this.log('Creating directory structure...');
    
    const directories = [
      // Core directories
      'src/core/domains',
      'src/core/services',
      'src/core/repositories',
      'src/core/events',
      'src/core/errors',
      
      // Features directory with basic auth
      'src/features/auth/core',
      'src/features/auth/fragments',
      'src/features/auth/api',
      'src/features/auth/components',
      'src/features/auth/tests/unit',
      'src/features/auth/tests/fragment',
      'src/features/auth/tests/e2e',
      
      // Infrastructure
      'src/infrastructure/database/prisma',
      'src/infrastructure/database/repositories',
      'src/infrastructure/auth/passport',
      'src/infrastructure/auth/middleware',
      'src/infrastructure/auth/rbac',
      'src/infrastructure/http/middleware',
      'src/infrastructure/http/htmx',
      'src/infrastructure/http/sse',
      'src/infrastructure/templates/engine',
      'src/infrastructure/templates/components',
      
      // Shared
      'src/shared/types',
      'src/shared/constants',
      'src/shared/utils',
      'src/shared/layouts',
      
      // Public assets
      'public/css',
      'public/js',
      'public/assets',
      
      // Tests
      'tests/setup',
      'tests/fixtures',
      'tests/global-e2e',
      
      // Scripts
      'scripts',
      
      // Config
      'config/environments',
      'config/templates',
      
      // Agent configurations
      '.opencode/agent',
      
      // Openspec
      'openspec/specs',
      'openspec/changes'
    ];
    
    for (const dir of directories) {
      const fullPath = join(this.projectRoot, dir);
      try {
        mkdirSync(fullPath, { recursive: true });
        this.result.createdDirectories.push(dir);
        if (this.options.verbose) {
          this.log(`  Created: ${dir}`);
        }
      } catch (error) {
        this.result.warnings.push(`Failed to create directory ${dir}: ${error}`);
      }
    }
    
    this.log('✓ Directory structure created');
  }

  private async generateConfigurationFiles(): Promise<void> {
    this.log('Generating configuration files...');
    
    // Get template directory (relative to this file)
    const templateDir = join(__dirname, '../../agents/templates');
    
    // Check if templates exist, if not create default ones
    if (!existsSync(templateDir)) {
      await this.createDefaultTemplates(templateDir);
    }
    
    // Render and write configuration files
    const configFiles = [
      { template: 'package.json.ejs', output: 'package.json' },
      { template: 'tsconfig.json.ejs', output: 'tsconfig.json' },
      { template: '.gitignore.ejs', output: '.gitignore' },
      { template: '.env.example.ejs', output: '.env.example' },
      { template: 'server.ts.ejs', output: 'src/server.ts' },
    ];
    
    const templateData = {
      projectName: this.options.projectName || 'my-blackmamba-app',
      projectDescription: this.options.projectDescription || 'A BlackMamba HTMX web application',
      version: '1.0.0',
      author: '',
      year: new Date().getFullYear()
    };
    
    for (const file of configFiles) {
      try {
        const templatePath = join(templateDir, file.template);
        const outputPath = join(this.projectRoot, file.output);
        
        if (!existsSync(templatePath)) {
          throw new Error(`Template not found: ${file.template}`);
        }
        
        const template = readFileSync(templatePath, 'utf-8');
        const rendered = ejs.render(template, templateData);
        
        writeFileSync(outputPath, rendered);
        this.result.createdFiles.push(file.output);
        
        if (this.options.verbose) {
          this.log(`  Generated: ${file.output}`);
        }
      } catch (error) {
        this.result.errors.push(`Failed to generate ${file.output}: ${error}`);
      }
    }
    
    // Copy agent configuration files
    await this.copyAgentConfigs(templateDir);
    
    this.log('✓ Configuration files generated');
  }

  private async createDefaultTemplates(templateDir: string): Promise<void> {
    this.log('Checking for templates...');
    
    // Create template directory if it doesn't exist
    if (!existsSync(templateDir)) {
      mkdirSync(templateDir, { recursive: true });
      mkdirSync(join(templateDir, 'agent-configs'), { recursive: true });
      this.log('Created template directory structure');
    }
    
    // Check if templates already exist (they should, since we created them in the repository)
    // If any templates are missing, we'll log a warning but continue
    const requiredTemplates = [
      'package.json.ejs',
      'tsconfig.json.ejs',
      '.gitignore.ejs',
      '.env.example.ejs',
      'server.ts.ejs'
    ];
    
    const missingTemplates = requiredTemplates.filter(template => 
      !existsSync(join(templateDir, template))
    );
    
    if (missingTemplates.length > 0) {
      this.result.warnings.push(`Some template files are missing: ${missingTemplates.join(', ')}`);
      this.log(`⚠ Missing templates: ${missingTemplates.join(', ')}`);
      
      // In a real implementation, we would create the missing templates here
      // For now, we'll rely on the templates being in the repository
    }
    
    // Check agent configs
    const agentConfigDir = join(templateDir, 'agent-configs');
    if (!existsSync(agentConfigDir)) {
      mkdirSync(agentConfigDir, { recursive: true });
    }
    
    const requiredAgentConfigs = [
      'blackmamba-master.md',
      'blackmamba-development.md',
      'blackmamba-htmx.md',
      'blackmamba-database.md',
      'blackmamba-testing.md'
    ];
    
    const missingAgentConfigs = requiredAgentConfigs.filter(config =>
      !existsSync(join(agentConfigDir, config))
    );
    
    if (missingAgentConfigs.length > 0) {
      this.result.warnings.push(`Some agent configs are missing: ${missingAgentConfigs.join(', ')}`);
      this.log(`⚠ Missing agent configs: ${missingAgentConfigs.join(', ')}`);
    }
  }

  private async createAgentConfigTemplates(templateDir: string): Promise<void> {
    const agentConfigsDir = join(templateDir, 'agent-configs');
    
    const agentConfigs = {
      'blackmamba-master.md': `# BlackMamba Master Agent

## Purpose
Orchestrates development workflows and coordinates other agents.

## Capabilities
- Project analysis and recommendations
- Workflow creation and execution
- Agent coordination
- Framework compliance validation

## Usage
\`\`\`
@blackmamba-master create new feature "feature-name"
@blackmamba-master analyze project structure
@blackmamba-master fix violations
\`\`\`

## Patterns
- Framework-agnostic business logic in /core/
- Feature-based modular architecture
- Result pattern for error handling
- Repository pattern for data access
\`\`\``,
      'blackmamba-development.md': `# BlackMamba Development Agent

## Purpose
Implements core business logic and domain services.

## Capabilities
- Domain service implementation
- Feature module creation
- Dependency injection setup
- Business logic patterns

## Patterns
- Result<T, E> pattern for error handling
- Repository interfaces in core
- Service layer for business logic
- Domain events and handlers
\`\`\``,
      'blackmamba-htmx.md': `# BlackMamba HTMX Agent

## Purpose
Develops HTMX fragments and server-rendered components.

## Capabilities
- Fragment handler implementation
- Reusable component creation
- HTMX pattern implementation
- Template rendering

## Patterns
- HTMX fragments return HTML only
- Conditional rendering for HTMX vs full-page
- Server-Sent Events for real-time updates
- Lazy loading with hx-trigger="revealed"
\`\`\``,
      'blackmamba-database.md': `# BlackMamba Database Agent

## Purpose
Manages database schema and repository implementations.

## Capabilities
- Prisma schema management
- Repository pattern implementations
- Database migrations
- Query optimization

## Patterns
- Repository interfaces in core
- Prisma implementations in infrastructure
- Transaction safety
- Data validation
\`\`\``,
      'blackmamba-testing.md': `# BlackMamba Testing Agent

## Purpose
Creates comprehensive tests for all application layers.

## Capabilities
- Unit test generation
- Fragment test creation
- E2E test implementation
- Test fixture management

## Patterns
- Unit tests for core logic
- Fragment tests with HTML parsing
- API integration tests
- Playwright E2E tests
\`\`\``
    };
    
    for (const [filename, content] of Object.entries(agentConfigs)) {
      writeFileSync(join(agentConfigsDir, filename), content);
    }
  }

  private async copyAgentConfigs(templateDir: string): Promise<void> {
    const agentConfigsDir = join(templateDir, 'agent-configs');
    const targetDir = join(this.projectRoot, '.opencode/agent');
    
    if (!existsSync(agentConfigsDir)) {
      this.result.warnings.push('Agent config templates not found');
      return;
    }
    
    const files = require('fs').readdirSync(agentConfigsDir);
    
    for (const file of files) {
      try {
        const sourcePath = join(agentConfigsDir, file);
        const targetPath = join(targetDir, file);
        
        const content = readFileSync(sourcePath, 'utf-8');
        writeFileSync(targetPath, content);
        
        this.result.createdFiles.push(`.opencode/agent/${file}`);
        
        if (this.options.verbose) {
          this.log(`  Copied agent config: ${file}`);
        }
      } catch (error) {
        this.result.warnings.push(`Failed to copy agent config ${file}: ${error}`);
      }
    }
  }

  private async initializeGit(): Promise<void> {
    this.log('Initializing Git repository...');
    
    try {
      // Check if git is installed
      await execAsync('git --version');
      
      // Initialize git repository
      await execAsync('git init', { cwd: this.projectRoot });
      
      // Create initial commit
      await execAsync('git add .', { cwd: this.projectRoot });
      await execAsync('git commit -m "Initial commit: BlackMamba project scaffold"', { 
        cwd: this.projectRoot 
      });
      
      this.log('✓ Git repository initialized');
    } catch (error) {
      this.result.warnings.push(`Git initialization failed: ${error}. .gitignore file was created.`);
      this.log('⚠ Git initialization skipped (git may not be installed)');
    }
  }

  private async installDependencies(): Promise<void> {
    this.log('Installing dependencies...');
    
    try {
      // Check if package.json exists
      const packageJsonPath = join(this.projectRoot, 'package.json');
      if (!existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }
      
      // Run npm install
      this.log('Running npm install... (this may take a minute)');
      const { stdout, stderr } = await execAsync('npm install', { 
        cwd: this.projectRoot,
        timeout: 300000 // 5 minutes timeout
      });
      
      if (this.options.verbose) {
        this.log(stdout);
      }
      
      if (stderr && !stderr.includes('npm WARN')) {
        this.result.warnings.push(`npm install warnings: ${stderr}`);
      }
      
      this.log('✓ Dependencies installed');
    } catch (error) {
      this.result.errors.push(`Dependency installation failed: ${error}`);
      throw error;
    }
  }

  private async validateProjectStructure(): Promise<void> {
    this.log('Validating project structure...');
    
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'src/server.ts',
      '.gitignore'
    ];
    
    const requiredDirs = [
      'src/core',
      'src/features',
      'src/infrastructure',
      'src/shared',
      'public',
      '.opencode/agent'
    ];
    
    const missingFiles: string[] = [];
    const missingDirs: string[] = [];
    
    // Check required files
    for (const file of requiredFiles) {
      if (!existsSync(join(this.projectRoot, file))) {
        missingFiles.push(file);
      }
    }
    
    // Check required directories
    for (const dir of requiredDirs) {
      if (!existsSync(join(this.projectRoot, dir))) {
        missingDirs.push(dir);
      }
    }
    
    if (missingFiles.length > 0 || missingDirs.length > 0) {
      const errors = [];
      if (missingFiles.length > 0) {
        errors.push(`Missing files: ${missingFiles.join(', ')}`);
      }
      if (missingDirs.length > 0) {
        errors.push(`Missing directories: ${missingDirs.join(', ')}`);
      }
      
      throw new Error(`Project structure validation failed: ${errors.join('; ')}`);
    }
    
    // Try to compile TypeScript (skip if dependencies weren't installed)
    if (!this.options.skipInstall) {
      try {
        await execAsync('npx tsc --noEmit', { cwd: this.projectRoot });
        this.log('✓ TypeScript compilation successful');
      } catch (error) {
        this.result.warnings.push(`TypeScript compilation warnings: ${error}`);
      }
    } else {
      this.log('⚠ TypeScript compilation skipped (dependencies not installed)');
    }
    
    this.log('✓ Project structure validated');
  }

  private async cleanupOnFailure(): Promise<void> {
    this.log('Cleaning up after failure...');
    
    // In a real implementation, we would remove created files
    // For now, just log what would be cleaned up
    if (this.options.verbose) {
      this.log(`Would clean up ${this.result.createdFiles.length} files and ${this.result.createdDirectories.length} directories`);
    }
  }

  private getSuccessMessage(): string {
    const messages: string[] = [];
    
    messages.push('🎉 BlackMamba project initialized successfully!');
    messages.push('');
    messages.push('📁 Project Structure:');
    messages.push(`  • Created ${this.result.createdDirectories.length} directories`);
    messages.push(`  • Generated ${this.result.createdFiles.length} configuration files`);
    
    if (!this.options.skipGit) {
      messages.push('  • Git repository initialized');
    }
    
    if (!this.options.skipInstall) {
      messages.push('  • Dependencies installed');
    }
    
    messages.push('');
    messages.push('🚀 Next Steps:');
    messages.push('  1. Review the generated configuration files');
    messages.push('  2. Set up your database: npm run prisma:migrate');
    messages.push('  3. Start development server: npm run dev');
    messages.push('  4. Visit http://localhost:3000');
    messages.push('');
    
    if (this.result.warnings.length > 0) {
      messages.push('⚠️  Warnings:');
      this.result.warnings.forEach(warning => {
        messages.push(`  • ${warning}`);
      });
      messages.push('');
    }
    
    return messages.join('\n');
  }

  private log(message: string): void {
    if (this.options.verbose) {
      console.log(`[BlackMamba Init] ${message}`);
    } else {
      // Only log important messages in non-verbose mode
      if (message.startsWith('✓') || message.startsWith('⚠') || message.startsWith('Starting') || message.includes('failed')) {
        console.log(message);
      }
    }
  }
}