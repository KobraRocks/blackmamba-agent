#!/usr/bin/env node

import { MasterAgent } from '../../src/agents/master/master-agent';
import { BlackMambaProjectAnalyzer } from '../../src/agents/shared/project-analyzer';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

interface RealTestResult {
  testId: string;
  testName: string;
  description: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  agentResponse: any;
  errors: string[];
  createdFiles: string[];
  metrics: {
    coordinationSteps: number;
    tasksCompleted: number;
    fileOperations: number;
  };
}

class RealAgentTester {
  private testResults: RealTestResult[] = [];
  private testProjectRoot: string;
  
  constructor(projectRoot: string) {
    this.testProjectRoot = projectRoot;
  }
  
  async runRealAgentTest(testName: string, taskDescription: string): Promise<RealTestResult> {
    console.log(`\n🧪 Running Real Agent Test: ${testName}`);
    console.log(`📝 Task: ${taskDescription}`);
    
    const startTime = performance.now();
    const createdFiles: string[] = [];
    
    try {
      // Create a fresh test directory
      const testDir = path.join(this.testProjectRoot, `test-${Date.now()}`);
      fs.mkdirSync(testDir, { recursive: true });
      
      // Copy basic project structure
      this.copyProjectStructure(testDir);
      
      // Initialize master agent
      const masterAgent = new MasterAgent(testDir);
      
      // Execute the task
      console.log(`🚀 Executing task with Master Agent...`);
      const agentResponse = await masterAgent.execute(taskDescription);
      
      // Collect created files
      this.collectCreatedFiles(testDir, createdFiles);
      
      const endTime = performance.now();
      
      const result: RealTestResult = {
        testId: `test-${Date.now()}`,
        testName,
        description: taskDescription,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: agentResponse.success,
        agentResponse,
        errors: agentResponse.errors || [],
        createdFiles,
        metrics: {
          coordinationSteps: agentResponse.tasksCompleted?.length || 0,
          tasksCompleted: agentResponse.tasksCompleted?.filter(t => t.status === 'completed').length || 0,
          fileOperations: createdFiles.length,
        },
      };
      
      console.log(`✅ Test completed: ${result.success ? 'PASS' : 'FAIL'}`);
      console.log(`⏱️  Duration: ${result.duration.toFixed(2)}ms`);
      console.log(`📊 Tasks completed: ${result.metrics.tasksCompleted}`);
      console.log(`📁 Files created: ${result.metrics.fileOperations}`);
      
      // Clean up test directory
      fs.rmSync(testDir, { recursive: true, force: true });
      
      this.testResults.push(result);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      
      const result: RealTestResult = {
        testId: `test-${Date.now()}`,
        testName,
        description: taskDescription,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        agentResponse: null,
        errors: [error instanceof Error ? error.message : String(error)],
        createdFiles: [],
        metrics: {
          coordinationSteps: 0,
          tasksCompleted: 0,
          fileOperations: 0,
        },
      };
      
      console.log(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
      
      this.testResults.push(result);
      return result;
    }
  }
  
  private copyProjectStructure(targetDir: string): void {
    // Create basic directory structure
    const dirs = [
      'src',
      'src/core',
      'src/features',
      'src/infrastructure', 
      'src/shared',
      'tests',
    ];
    
    for (const dir of dirs) {
      fs.mkdirSync(path.join(targetDir, dir), { recursive: true });
    }
    
    // Create minimal package.json
    const packageJson = {
      name: 'real-agent-test',
      version: '1.0.0',
      scripts: {
        dev: 'ts-node src/server.ts',
        test: 'jest',
      },
      dependencies: {
        express: '^4.18.2',
        ejs: '^3.1.9',
      },
      devDependencies: {
        typescript: '^5.0.0',
        'ts-node': '^10.9.1',
        jest: '^29.0.0',
      },
    };
    
    fs.writeFileSync(
      path.join(targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: './src',
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    };
    
    fs.writeFileSync(
      path.join(targetDir, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2)
    );
    
    // Create basic server.ts
    const serverContent = `import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Real Agent Test Server' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
});`;
    
    fs.writeFileSync(
      path.join(targetDir, 'src/server.ts'),
      serverContent
    );
  }
  
  private collectCreatedFiles(testDir: string, createdFiles: string[]): void {
    // Walk through directory and collect all created files
    const walk = (dir: string): void => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walk(filePath);
        } else {
          // Only include non-standard files (not from initial setup)
          if (!this.isStandardFile(filePath)) {
            createdFiles.push(path.relative(testDir, filePath));
          }
        }
      }
    };
    
    walk(testDir);
  }
  
  private isStandardFile(filePath: string): boolean {
    const standardFiles = [
      'package.json',
      'tsconfig.json',
      'src/server.ts',
    ];
    
    const fileName = path.basename(filePath);
    return standardFiles.includes(fileName);
  }
  
  generateAnalysisReport(): string {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    let report = `# Real Agent Testing Analysis Report\n\n`;
    report += `## Executive Summary\n`;
    report += `- Total Tests: ${totalTests}\n`;
    report += `- Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)\n`;
    report += `- Failed: ${failedTests}\n\n`;
    
    report += `## Agent Performance Analysis\n\n`;
    
    // Analyze coordination effectiveness
    const coordinationTests = this.testResults.filter(r => 
      r.testName.toLowerCase().includes('coordination') || 
      r.testName.toLowerCase().includes('workflow')
    );
    
    if (coordinationTests.length > 0) {
      report += `### Master Agent Coordination\n`;
      const avgSteps = coordinationTests.reduce((sum, t) => sum + t.metrics.coordinationSteps, 0) / coordinationTests.length;
      const avgTasks = coordinationTests.reduce((sum, t) => sum + t.metrics.tasksCompleted, 0) / coordinationTests.length;
      const successRate = (coordinationTests.filter(t => t.success).length / coordinationTests.length) * 100;
      
      report += `- Average coordination steps: ${avgSteps.toFixed(1)}\n`;
      report += `- Average tasks completed: ${avgTasks.toFixed(1)}\n`;
      report += `- Success rate: ${successRate.toFixed(1)}%\n\n`;
      
      if (successRate < 80) {
        report += `⚠️ **Issue**: Master agent coordination success rate is low\n`;
        report += `**Recommendation**: Improve workflow validation and error handling\n\n`;
      }
    }
    
    // Analyze file creation patterns
    const fileCreationTests = this.testResults.filter(r => r.metrics.fileOperations > 0);
    if (fileCreationTests.length > 0) {
      report += `### File Creation Patterns\n`;
      const avgFiles = fileCreationTests.reduce((sum, t) => sum + t.metrics.fileOperations, 0) / fileCreationTests.length;
      
      report += `- Average files created per test: ${avgFiles.toFixed(1)}\n`;
      
      // Analyze file types
      const allFiles = fileCreationTests.flatMap(t => t.createdFiles);
      const fileExtensions = allFiles.map(f => path.extname(f)).filter(ext => ext);
      const extensionCounts: Record<string, number> = {};
      
      for (const ext of fileExtensions) {
        extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
      }
      
      report += `- File types created:\n`;
      for (const [ext, count] of Object.entries(extensionCounts)) {
        const percentage = (count / allFiles.length) * 100;
        report += `  - ${ext}: ${count} (${percentage.toFixed(1)}%)\n`;
      }
      report += `\n`;
    }
    
    // Analyze error patterns
    const failedTestResults = this.testResults.filter(r => !r.success);
    if (failedTestResults.length > 0) {
      report += `### Failure Analysis\n`;
      
      const errorCategories: Record<string, number> = {};
      for (const test of failedTestResults) {
        for (const error of test.errors) {
          const category = this.categorizeError(error);
          errorCategories[category] = (errorCategories[category] || 0) + 1;
        }
      }
      
      report += `- Error categories:\n`;
      for (const [category, count] of Object.entries(errorCategories)) {
        report += `  - ${category}: ${count} occurrence(s)\n`;
      }
      report += `\n`;
    }
    
    report += `## Agent Behavior Observations\n\n`;
    
    // Check for missing agent capabilities
    const testNames = this.testResults.map(t => t.testName.toLowerCase());
    const expectedCapabilities = [
      'business logic',
      'htmx fragment', 
      'database schema',
      'authentication',
      'api endpoint',
      'testing',
      'css design',
    ];
    
    const missingCapabilities = expectedCapabilities.filter(capability => 
      !testNames.some(name => name.includes(capability))
    );
    
    if (missingCapabilities.length > 0) {
      report += `### Missing Agent Capability Tests\n`;
      report += `The following capabilities were not tested:\n`;
      for (const capability of missingCapabilities) {
        report += `- ${capability}\n`;
      }
      report += `\n`;
    }
    
    report += `## Recommendations for Agent Improvements\n\n`;
    
    const recommendations: string[] = [];
    
    // Performance recommendations
    const slowTests = this.testResults.filter(t => t.duration > 5000);
    if (slowTests.length > 0) {
      recommendations.push(`**Performance**: ${slowTests.length} test(s) took >5 seconds. Consider optimizing agent execution time.`);
    }
    
    // Coordination recommendations
    const lowTaskCompletion = this.testResults.filter(t => 
      t.metrics.coordinationSteps > 0 && 
      (t.metrics.tasksCompleted / t.metrics.coordinationSteps) < 0.5
    );
    if (lowTaskCompletion.length > 0) {
      recommendations.push(`**Coordination**: ${lowTaskCompletion.length} test(s) had low task completion rate. Improve agent task routing and validation.`);
    }
    
    // Error handling recommendations
    const unhandledErrorTests = this.testResults.filter(t => 
      !t.success && 
      t.errors.some(e => e.includes('unhandled') || e.includes('unexpected'))
    );
    if (unhandledErrorTests.length > 0) {
      recommendations.push(`**Error Handling**: ${unhandledErrorTests.length} test(s) had unhandled errors. Improve error catching and recovery mechanisms.`);
    }
    
    // File creation recommendations
    const noFileCreation = this.testResults.filter(t => 
      t.testName.toLowerCase().includes('create') && 
      t.metrics.fileOperations === 0
    );
    if (noFileCreation.length > 0) {
      recommendations.push(`**File Operations**: ${noFileCreation.length} creation test(s) didn't create files. Ensure agents properly generate project artifacts.`);
    }
    
    if (recommendations.length === 0) {
      report += `All agents performing within expected parameters. No major improvements needed at this time.\n`;
    } else {
      for (const rec of recommendations) {
        report += `1. ${rec}\n`;
      }
    }
    
    report += `\n## Potential New Agent Types\n`;
    report += `Based on testing gaps, consider adding:\n`;
    report += `1. **Performance Agent** - For optimization and profiling\n`;
    report += `2. **Security Agent** - For vulnerability scanning and security patterns\n`;
    report += `3. **Documentation Agent** - For API docs, READMEs, and inline documentation\n`;
    report += `4. **Deployment Agent** - For CI/CD, Docker, and deployment configurations\n`;
    report += `5. **Code Review Agent** - For quality assurance and best practices enforcement\n`;
    
    return report;
  }
  
  private categorizeError(error: string): string {
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('git') || lowerError.includes('branch')) {
      return 'Git Operations';
    } else if (lowerError.includes('test') || lowerError.includes('assert')) {
      return 'Testing';
    } else if (lowerError.includes('file') || lowerError.includes('directory')) {
      return 'File System';
    } else if (lowerError.includes('agent') || lowerError.includes('coordination')) {
      return 'Agent Coordination';
    } else if (lowerError.includes('timeout') || lowerError.includes('duration')) {
      return 'Performance';
    } else {
      return 'Other';
    }
  }
  
  getAllResults(): RealTestResult[] {
    return this.testResults;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Real Agent Testing Analysis\n');
  
  const tester = new RealAgentTester('./test-projects/real-agent-tests');
  
  // Run a series of real agent tests
  const tests = [
    {
      name: 'Basic Feature Coordination',
      task: 'Create new feature "user profiles"',
    },
    {
      name: 'Business Logic Implementation',
      task: 'Implement user registration service with email validation',
    },
    {
      name: 'HTMX Fragment Development',
      task: 'Create user profile HTMX fragment with edit functionality',
    },
    {
      name: 'Database Schema Management',
      task: 'Update database schema for user profiles',
    },
    {
      name: 'Bug Fix Workflow',
      task: 'Fix authentication token expiration issue',
    },
  ];
  
  for (const test of tests) {
    await tester.runRealAgentTest(test.name, test.task);
  }
  
  // Generate and save report
  const report = tester.generateAnalysisReport();
  const reportPath = './tests/agent-testing/reports/real-agent-analysis.md';
  fs.writeFileSync(reportPath, report);
  
  console.log(`\n📊 Testing Complete!`);
  console.log(`📄 Report saved to: ${reportPath}`);
  
  const results = tester.getAllResults();
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total} (${((passed / total) * 100).toFixed(1)}%)`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { RealAgentTester };