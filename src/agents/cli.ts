#!/usr/bin/env node

import { Command } from 'commander';
import { MasterAgent } from './master/master-agent';
import { BlackMambaProjectAnalyzer } from './shared/project-analyzer';
import { GitWorkflowManager } from './shared/git-workflow';

const program = new Command();

program
  .name('blackmamba-agent')
  .description('BlackMamba Framework Agent System')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze project structure and provide recommendations')
  .action(async () => {
    console.log('🔍 Analyzing BlackMamba project structure...\n');
    
    const analyzer = new BlackMambaProjectAnalyzer();
    const analysis = analyzer.analyze();
    
    console.log(analyzer.formatAnalysis(analysis));
    
    if (analysis.violations.length > 0) {
      console.log('⚠️  Framework violations detected. Consider running:');
      console.log('   blackmamba-agent fix-violations');
    }
    
    if (analysis.agentSuggestions.development.length > 0) {
      console.log('\n💡 Development Agent suggestions:');
      analysis.agentSuggestions.development.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
    }
    
    if (analysis.agentSuggestions.htmx.length > 0) {
      console.log('\n🎨 HTMX Agent suggestions:');
      analysis.agentSuggestions.htmx.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
    }
    
    if (analysis.agentSuggestions.database.length > 0) {
      console.log('\n🗄️  Database Agent suggestions:');
      analysis.agentSuggestions.database.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
    }
    
    if (analysis.agentSuggestions.testing.length > 0) {
      console.log('\n🧪 Testing Agent suggestions:');
      analysis.agentSuggestions.testing.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
    }
  });

program
  .command('new-feature <name>')
  .description('Create a new feature following BlackMamba patterns')
  .option('-d, --description <description>', 'Feature description')
  .action(async (name, options) => {
    console.log(`🚀 Creating new feature: ${name}`);
    
    const agent = new MasterAgent();
    const description = options.description || `Create new feature "${name}"`;
    
    const result = await agent.execute(`Create new feature "${name}": ${description}`);
    
    console.log('\n' + result.message);
    
    if (result.tasksCompleted.length > 0) {
      console.log('\n✅ Completed tasks:');
      result.tasksCompleted.forEach(task => {
        console.log(`   - ${task.description}`);
      });
    }
    
    if (result.nextSteps && result.nextSteps.length > 0) {
      console.log('\n📝 Next steps:');
      result.nextSteps.forEach(step => {
        console.log(`   - ${step}`);
      });
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
  });

program
  .command('fix-violations')
  .description('Fix framework violations in the project')
  .action(async () => {
    console.log('🔧 Fixing framework violations...\n');
    
    const agent = new MasterAgent();
    const result = await agent.execute('Fix all framework violations');
    
    console.log('\n' + result.message);
    
    if (result.tasksCompleted.length > 0) {
      console.log('\n✅ Fixed violations:');
      result.tasksCompleted.forEach(task => {
        console.log(`   - ${task.description}`);
      });
    }
    
    if (result.nextSteps && result.nextSteps.length > 0) {
      console.log('\n📝 Next steps:');
      result.nextSteps.forEach(step => {
        console.log(`   - ${step}`);
      });
    }
  });

program
  .command('workflows')
  .description('List all executed workflows')
  .action(async () => {
    const agent = new MasterAgent();
    const workflows = agent.getAllWorkflows();
    
    if (workflows.length === 0) {
      console.log('No workflows executed yet.');
      return;
    }
    
    console.log('📋 Executed Workflows:\n');
    
    workflows.forEach(workflow => {
      console.log(`🆔 ${workflow.id}`);
      console.log(`📛 ${workflow.name}`);
      console.log(`📝 ${workflow.description}`);
      console.log(`📊 Status: ${workflow.status}`);
      console.log(`📍 Current Step: ${workflow.currentStep}/${workflow.steps.length}`);
      console.log(`✅ Completed Tasks: ${workflow.tasks.filter(t => t.status === 'completed').length}/${workflow.tasks.length}`);
      console.log('---');
    });
  });

program
  .command('git-status')
  .description('Check git workflow status and recommendations')
  .action(() => {
    console.log('🔍 Checking git workflow status...\n');
    
    const gitWorkflow = new GitWorkflowManager();
    const status = gitWorkflow.getWorkflowStatus();
    
    console.log('📊 Git Workflow Status:');
    console.log(`   Initialized: ${status.initialized ? '✅ Yes' : '❌ No'}`);
    console.log(`   Current Branch: ${status.currentBranch}`);
    console.log(`   Clean Working Directory: ${status.branchInfo.isClean ? '✅ Yes' : '❌ No'}`);
    console.log(`   Remote Configured: ${status.branchInfo.remoteExists ? '✅ Yes' : '❌ No'}`);
    
    if (status.branchInfo.ahead > 0) {
      console.log(`   Ahead of remote: ${status.branchInfo.ahead} commit(s)`);
    }
    
    if (status.branchInfo.behind > 0) {
      console.log(`   Behind remote: ${status.branchInfo.behind} commit(s)`);
    }
    
    if (status.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      status.recommendations.forEach(rec => {
        console.log(`   - ${rec}`);
      });
    }
  });

program
  .command('create-branch <type> <name>')
  .description('Create a new git branch for development')
  .option('-d, --description <description>', 'Branch description')
  .option('-i, --issue <issueId>', 'Issue/PR ID')
  .action((type, name, options) => {
    console.log(`🌿 Creating ${type} branch: ${name}`);
    
    const gitWorkflow = new GitWorkflowManager();
    
    const branchSpec = {
      type: type as any,
      name,
      description: options.description || `Implement ${name}`,
      issueId: options.issue,
    };
    
    const result = gitWorkflow.createBranch(branchSpec);
    
    if (result.success) {
      console.log(`\n✅ ${result.message}`);
      console.log(`   Branch: ${result.branchName}`);
      console.log('\n📝 Next steps:');
      console.log('   1. Implement your feature/bugfix/spec');
      console.log('   2. Commit changes regularly');
      console.log('   3. Run tests: npm test');
      console.log('   4. When ready, validate for merge: blackmamba-agent validate-merge');
    } else {
      console.log(`\n❌ ${result.message}`);
    }
  });

program
  .command('validate-merge')
  .description('Validate current branch for merge into main')
  .action(() => {
    console.log('🔍 Validating branch for merge...\n');
    
    const gitWorkflow = new GitWorkflowManager();
    const validation = gitWorkflow.validateForMerge();
    
    console.log('📋 Merge Validation Results:');
    
    if (validation.valid) {
      console.log('✅ Branch is ready for merge!');
    } else {
      console.log('❌ Branch cannot be merged:');
      validation.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      validation.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
    
    if (validation.suggestions.length > 0) {
      console.log('\n💡 Suggestions:');
      validation.suggestions.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
    }
    
    if (validation.valid) {
      console.log('\n🚀 To merge, run:');
      console.log('   git checkout main');
      console.log('   git merge --no-ff <branch-name>');
      console.log('   git push origin main');
    }
  });

program
  .command('patterns')
  .description('Show BlackMamba framework patterns')
  .action(() => {
    console.log('🏗️  BlackMamba Framework Patterns:\n');
    
    const patterns = {
      'Directory Structure': [
        'src/core/ - Framework-agnostic business logic',
        'src/features/{feature}/ - Self-contained feature modules',
        'src/infrastructure/ - Framework implementations',
        'src/shared/ - Shared utilities and types',
        'src/agents/ - Agent system implementation',
      ],
      'Core Patterns': [
        'Framework-agnostic business logic in /core/',
        'Repository pattern: interfaces in core, implementations in infrastructure',
        'Result<T, E> pattern for error handling',
        'Dependency injection for loose coupling',
      ],
      'Feature Modules': [
        'Each feature has: core/, fragments/, api/, components/, tests/',
        'Feature modules export unified interface',
        'Business logic separated from presentation',
        'HTMX fragments for server-rendered UI',
      ],
      'Agent System': [
        'Master Agent - Development workflow orchestration',
        'Development Agent - Core business logic implementation',
        'HTMX Agent - Fragment and component development',
        'Database Agent - Prisma schema and repository operations',
        'Auth Agent - Authentication and RBAC implementation',
        'API Agent - RESTful API endpoint implementation',
        'Testing Agent - Comprehensive test generation',
      ],
      'Git Workflow': [
        'Automatic branch creation for features/specs/bugs',
        'Branch naming: {type}/{name} or {type}/{issue-id}-{name}',
        'Pre-merge validation and testing',
        'Conventional commit messages',
        'Quality gates before merge',
      ],
      'Testing Strategy': [
        'Unit tests for core business logic',
        'Fragment tests for HTML output validation',
        'API integration tests',
        'E2E tests with Playwright for user flows',
        'Snapshot testing for templates',
      ],
      'HTMX Integration': [
        'HTMX fragments return HTML only',
        'Use HTMX middleware helpers',
        'Conditional rendering for HTMX vs full-page requests',
        'Server-Sent Events for real-time updates',
      ],
      'Authentication & Security': [
        'Passport strategies for authentication',
        'RBAC middleware for authorization',
        'Secure password hashing (bcrypt/argon2)',
        'CSRF protection and security headers',
        'HTMX-aware auth flows',
      ],
      'API Design': [
        'RESTful endpoints with proper HTTP methods',
        'API versioning strategy',
        'OpenAPI/Swagger documentation',
        'Consistent response formats',
        'Input validation and error handling',
      ],
    };
    
    Object.entries(patterns).forEach(([category, items]) => {
      console.log(`📁 ${category}:`);
      items.forEach(item => console.log(`   • ${item}`));
      console.log();
    });
  });

program
  .command('init')
  .description('Initialize a new BlackMamba project')
  .option('--skip-git', 'Skip Git repository initialization')
  .option('--skip-install', 'Skip npm dependency installation')
  .option('--verbose', 'Show detailed output')
  .option('--name <name>', 'Project name (default: my-blackmamba-app)')
  .option('--description <description>', 'Project description')
  .action(async (options) => {
    console.log('🚀 Initializing new BlackMamba project...\n');
    
    try {
      const { ProjectInitializer } = await import('./services/project-initializer');
      
      const initializer = new ProjectInitializer(process.cwd(), {
        skipGit: options.skipGit,
        skipInstall: options.skipInstall,
        verbose: options.verbose,
        projectName: options.name,
        projectDescription: options.description
      });
      
      const result = await initializer.initialize();
      
      console.log('\n' + result.message);
      
      if (!result.success) {
        console.error('\n❌ Initialization failed:');
        result.errors.forEach(error => console.error(`  • ${error}`));
        process.exit(1);
      }
      
    } catch (error) {
      console.error('\n❌ Failed to initialize project:');
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
      console.error('\n💡 Make sure you are in an empty directory and have write permissions.');
      process.exit(1);
    }
  });

program.parse(process.argv);