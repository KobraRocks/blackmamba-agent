import { BaseAgent, AgentContext, AgentResponse, AgentTask } from '../shared/agent-base';
import { ProjectAnalysis } from '../shared/project-analyzer';
import { GitWorkflowManager, BranchSpec } from '../shared/git-workflow';

export interface WorkflowStep {
  step: number;
  description: string;
  agentType: 'development' | 'htmx' | 'database' | 'testing' | 'auth' | 'api' | 'analysis' | 'git' | 'web-designer';
  tasks: string[];
  dependencies: number[];
}

export interface DevelopmentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  currentStep: number;
  status: 'planning' | 'executing' | 'completed' | 'failed';
  tasks: AgentTask[];
}

export class MasterAgent extends BaseAgent {
  private workflows: Map<string, DevelopmentWorkflow> = new Map();
  private currentWorkflowId?: string;
  private gitWorkflow: GitWorkflowManager;
  
  constructor(projectRoot: string = process.cwd()) {
    super(projectRoot);
    this.gitWorkflow = new GitWorkflowManager(this.context.projectRoot);
  }
  
  async execute(taskDescription: string): Promise<AgentResponse> {
    this.updateContext({ taskDescription });
    
    console.log('Master Agent executing task:', taskDescription);
    console.log('Project analysis:', this.formatAnalysis());
    
    // Analyze the request and determine workflow
    const workflow = this.analyzeRequest(taskDescription);
    this.currentWorkflowId = workflow.id;
    this.workflows.set(workflow.id, workflow);
    
    // Execute the workflow
    const result = await this.executeWorkflow(workflow);
    
    return {
      success: result.success,
      message: result.message,
      tasksCompleted: workflow.tasks.filter(t => t.status === 'completed'),
      nextSteps: result.nextSteps,
      warnings: result.warnings,
      errors: result.errors,
    };
  }
  
  private analyzeRequest(taskDescription: string): DevelopmentWorkflow {
    const analysis = this.context.analysis;
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simple keyword-based workflow detection
    const lowerTask = taskDescription.toLowerCase();
    
    if (lowerTask.includes('new feature') || lowerTask.includes('create feature')) {
      return this.createNewFeatureWorkflow(workflowId, taskDescription, analysis);
    } else if (lowerTask.includes('analyze') || lowerTask.includes('review')) {
      return this.createAnalysisWorkflow(workflowId, taskDescription, analysis);
    } else if (lowerTask.includes('fix') || lowerTask.includes('violation')) {
      return this.createFixViolationsWorkflow(workflowId, taskDescription, analysis);
    } else {
      return this.createGenericWorkflow(workflowId, taskDescription, analysis);
    }
  }
  
  private createNewFeatureWorkflow(
    id: string,
    taskDescription: string,
    analysis: ProjectAnalysis
  ): DevelopmentWorkflow {
    // Extract feature name from task description
    const featureMatch = taskDescription.match(/feature\s+["']?([^"'\s]+)["']?/i) ||
                        taskDescription.match(/create\s+["']?([^"'\s]+)["']?/i);
    const featureName = featureMatch ? featureMatch[1] : 'new-feature';
    
    // Create git branch for the feature
    const branchSpec: BranchSpec = {
      type: 'feature',
      name: featureName,
      description: `Implement ${featureName} feature`,
    };
    
    const branchResult = this.gitWorkflow.createBranch(branchSpec);
    const branchStep: WorkflowStep[] = branchResult.success ? [
      {
        step: 1,
        description: 'Create git branch for feature development',
        agentType: 'git' as const,
        tasks: [
          `Create branch: ${branchResult.branchName}`,
          'Initialize branch with base structure',
        ],
        dependencies: [],
      }
    ] : [];
    
    const baseStep = branchResult.success ? 2 : 1;
    
    const workflow: DevelopmentWorkflow = {
      id,
      name: `Create Feature: ${featureName}`,
      description: `Create new feature "${featureName}" following BlackMamba patterns`,
      steps: [
        ...branchStep,
        {
          step: baseStep,
          description: 'Analyze project structure and requirements',
          agentType: 'analysis' as const,
          tasks: ['Analyze current project structure', 'Identify requirements for new feature'],
          dependencies: branchResult.success ? [1] : [],
        },
        {
          step: baseStep + 1,
          description: 'Create feature directory structure',
          agentType: 'development' as const,
          tasks: [
            `Create feature directory: src/features/${featureName}`,
            'Create core, fragments, api, components, tests subdirectories',
          ],
          dependencies: [baseStep],
        },
        {
          step: baseStep + 2,
          description: 'Implement core business logic',
          agentType: 'development' as const,
          tasks: [
            `Create domain entities for ${featureName}`,
            `Implement business services for ${featureName}`,
            'Create repository interfaces',
            'Define DTOs and types',
          ],
          dependencies: [baseStep + 1],
        },
        {
          step: baseStep + 3,
          description: 'Set up database entities',
          agentType: 'database' as const,
          tasks: [
            'Update Prisma schema if needed',
            'Create database migrations',
            'Implement repository classes',
          ],
          dependencies: [baseStep + 2],
        },
        {
          step: baseStep + 4,
          description: 'Implement authentication if needed',
          agentType: 'auth' as const,
          tasks: [
            'Add authentication requirements analysis',
            'Implement auth middleware if required',
            'Set up RBAC permissions',
          ],
          dependencies: [baseStep + 2],
        },
        {
          step: baseStep + 5,
          description: 'Create HTMX fragments and components',
          agentType: 'htmx' as const,
          tasks: [
            `Create HTMX fragments for ${featureName}`,
            'Implement UI components',
            'Set up fragment routes',
            'Coordinate with Web Designer for styling',
          ],
          dependencies: [baseStep + 1, baseStep + 2],
        },
        {
          step: baseStep + 6,
          description: 'Implement CSS styling and design',
          agentType: 'web-designer' as const,
          tasks: [
            `Create CSS components for ${featureName}`,
            'Implement variable-based theme system',
            'Ensure responsive and accessible design',
            'Coordinate CSS variables with HTMX fragments',
          ],
          dependencies: [baseStep + 5], // Depends on HTMX structure
        },
        {
          step: baseStep + 7,
          description: 'Implement API endpoints',
          agentType: 'api' as const,
          tasks: [
            `Create API routes for ${featureName}`,
            'Implement request/response handlers',
            'Set up API versioning',
            'Create OpenAPI documentation',
          ],
          dependencies: [baseStep + 2, baseStep + 3, baseStep + 4],
        },
        {
          step: baseStep + 8,
          description: 'Create comprehensive tests',
          agentType: 'testing' as const,
          tasks: [
            `Create unit tests for ${featureName} core logic`,
            'Create fragment tests for HTMX components',
            'Create CSS styling tests',
            'Create API integration tests',
            'Create E2E tests for user flows',
          ],
          dependencies: [baseStep + 2, baseStep + 5, baseStep + 6, baseStep + 7],
        },
        {
          step: baseStep + 9,
          description: 'Verify framework compliance',
          agentType: 'analysis' as const,
          tasks: [
            'Verify all code follows BlackMamba patterns',
            'Check directory structure compliance',
            'Validate separation of concerns',
            'Validate CSS follows BlackMamba philosophy',
            'Run automated tests',
          ],
          dependencies: [baseStep + 1, baseStep + 2, baseStep + 3, baseStep + 4, baseStep + 5, baseStep + 6, baseStep + 7, baseStep + 8],
        },
        {
          step: baseStep + 10,
          description: 'Validate and prepare for merge',
          agentType: 'git' as const,
          tasks: [
            'Run final validation checks',
            'Ensure all tests pass',
            'Update documentation',
            'Prepare merge request',
          ],
          dependencies: [baseStep + 9],
        },
      ],
      currentStep: 1,
      status: 'planning',
      tasks: [],
    };
    
    // Create initial tasks from first step
    workflow.tasks = workflow.steps[0].tasks.map(task => 
      this.createTask(task, 'analysis', 'medium')
    );
    
    return workflow;
  }
  
  private createAnalysisWorkflow(
    id: string,
    taskDescription: string,
    analysis: ProjectAnalysis
  ): DevelopmentWorkflow {
    const workflow: DevelopmentWorkflow = {
      id,
      name: 'Project Analysis',
      description: 'Analyze project structure and provide recommendations',
      steps: [
        {
          step: 1,
          description: 'Comprehensive project analysis',
          agentType: 'analysis' as const,
          tasks: [
            'Analyze directory structure',
            'Check framework pattern compliance',
            'Identify violations and issues',
            'Generate recommendations',
          ],
          dependencies: [],
        },
        {
          step: 2,
          description: 'Generate agent-specific suggestions',
          agentType: 'analysis' as const,
          tasks: [
            'Create development agent suggestions',
            'Create HTMX agent suggestions',
            'Create database agent suggestions',
            'Create testing agent suggestions',
            'Create auth agent suggestions',
            'Create API agent suggestions',
          ],
          dependencies: [1],
        },
      ],
      currentStep: 1,
      status: 'planning',
      tasks: [],
    };
    
    workflow.tasks = workflow.steps[0].tasks.map(task => 
      this.createTask(task, 'development', 'medium')
    );
    
    return workflow;
  }
  
  private createFixViolationsWorkflow(
    id: string,
    taskDescription: string,
    analysis: ProjectAnalysis
  ): DevelopmentWorkflow {
    const workflow: DevelopmentWorkflow = {
      id,
      name: 'Fix Framework Violations',
      description: 'Fix identified framework violations and improve structure',
      steps: [
        {
          step: 1,
          description: 'Analyze current violations',
          agentType: 'analysis' as const,
          tasks: [
            'Review all framework violations',
            'Prioritize fixes based on impact',
            'Create fix plan',
          ],
          dependencies: [],
        },
        {
          step: 2,
          description: 'Execute fixes based on violation type',
          agentType: 'analysis' as const,
          tasks: analysis.violations.map(v => `Fix: ${v.message}`),
          dependencies: [1],
        },
      ],
      currentStep: 1,
      status: 'planning',
      tasks: [],
    };
    
    workflow.tasks = workflow.steps[0].tasks.map(task => 
      this.createTask(task, 'analysis', 'high')
    );
    
    return workflow;
  }
  
  private createGenericWorkflow(
    id: string,
    taskDescription: string,
    analysis: ProjectAnalysis
  ): DevelopmentWorkflow {
    const workflow: DevelopmentWorkflow = {
      id,
      name: 'Generic Development Task',
      description: taskDescription,
      steps: [
        {
          step: 1,
          description: 'Analyze task requirements',
          agentType: 'analysis' as const,
          tasks: [
            'Understand task requirements',
            'Identify affected components',
            'Determine required agents',
          ],
          dependencies: [],
        },
        {
          step: 2,
          description: 'Execute task with appropriate agents',
          agentType: 'development' as const,
          tasks: ['Execute main task'],
          dependencies: [1],
        },
        {
          step: 3,
          description: 'Verify and test',
          agentType: 'testing' as const,
          tasks: ['Verify implementation', 'Create tests if needed'],
          dependencies: [2],
        },
      ],
      currentStep: 1,
      status: 'planning',
      tasks: [],
    };
    
    workflow.tasks = workflow.steps[0].tasks.map(task => 
      this.createTask(task, 'development', 'medium')
    );
    
    return workflow;
  }
  
  private async executeWorkflow(workflow: DevelopmentWorkflow): Promise<{
    success: boolean;
    message: string;
    nextSteps?: string[];
    warnings?: string[];
    errors?: string[];
  }> {
    workflow.status = 'executing';
    
    try {
      // First, ensure git repository is initialized and we're on the correct branch
      if (workflow.name.includes('Create Feature')) {
        const gitStatus = this.gitWorkflow.getWorkflowStatus();
        if (!gitStatus.initialized) {
          const initialized = this.gitWorkflow.initializeGit();
          if (!initialized) {
            return {
              success: false,
              message: 'Failed to initialize git repository. Please initialize git manually.',
              errors: ['Git repository initialization failed'],
            };
          }
        }
        
        // Check if we're on a feature branch (should be created in createNewFeatureWorkflow)
        const branchInfo = this.gitWorkflow.getBranchInfo();
        if (!branchInfo.currentBranch.startsWith('feature/')) {
          return {
            success: false,
            message: 'Not on a feature branch. Please create feature branch first.',
            errors: [`Current branch: ${branchInfo.currentBranch}, expected feature/*`],
          };
        }
        
        if (!branchInfo.isClean) {
          return {
            success: false,
            message: 'Branch has uncommitted changes. Please commit or stash changes before proceeding.',
            errors: ['Uncommitted changes detected'],
          };
        }
      }
      
      for (const step of workflow.steps) {
        if (step.step < workflow.currentStep) continue;
        
        console.log(`\n=== Executing step ${step.step}: ${step.description} ===`);
        
        // Update workflow state
        workflow.currentStep = step.step;
        
        // Execute tasks for this step
        for (const taskDescription of step.tasks) {
          const task = this.createTask(
            taskDescription,
            step.agentType === 'analysis' ? 'development' : step.agentType,
            'high'
          );
          
          workflow.tasks.push(task);
          
          // Execute task with appropriate agent
          const taskResult = await this.executeAgentTask(taskDescription, step.agentType, workflow);
          
          if (!taskResult.success) {
            // Handle task failure
            if (step.agentType === 'testing' && taskResult.errors?.some(e => e.includes('test'))) {
              // Test failures - detect which agent should fix them based on failure domain
              console.log(`Test failure detected: ${taskResult.message}`);
              
              // Determine which agent should fix this failure
              const fixAgentType = this.detectFailureDomain(taskDescription, taskResult.details);
              console.log(`Failure domain analysis: ${fixAgentType} agent should fix this`);
              console.log(`Initiating fix cycle with ${fixAgentType} agent...`);
              
              const fixTask = `Fix issues identified in tests: ${taskDescription}`;
              const fixResult = await this.executeAgentTask(fixTask, fixAgentType, workflow);
              
              if (!fixResult.success) {
                return {
                  success: false,
                  message: `Failed to fix test issues with ${fixAgentType} agent: ${fixResult.message}`,
                  errors: fixResult.errors,
                  warnings: fixResult.warnings,
                };
              }
              
              // Retry the test after fix
              console.log('Retrying tests after fixes...');
              const retryResult = await this.executeAgentTask(taskDescription, 'testing', workflow);
              
              if (!retryResult.success) {
                return {
                  success: false,
                  message: `Tests still failing after ${fixAgentType} agent fixes: ${retryResult.message}`,
                  errors: retryResult.errors,
                  warnings: retryResult.warnings,
                };
              }
              
              // Mark original task as completed after successful retry
              const completedTask = this.markTaskComplete(task, { 
                result: `completed after ${fixAgentType} agent fix cycle`,
                details: retryResult.details,
                fixAgent: fixAgentType,
              });
              const taskIndex = workflow.tasks.findIndex(t => t.id === task.id);
              workflow.tasks[taskIndex] = completedTask;
              continue;
            }
            
            return {
              success: false,
              message: `Task failed: ${taskResult.message}`,
              errors: taskResult.errors,
              warnings: taskResult.warnings,
            };
          }
          
          // Mark task as completed
          const completedTask = this.markTaskComplete(task, { 
            result: 'completed successfully',
            details: taskResult.details 
          });
          const taskIndex = workflow.tasks.findIndex(t => t.id === task.id);
          workflow.tasks[taskIndex] = completedTask;
          
          console.log(`✓ Task completed: ${taskDescription}`);
        }
        
        // Check dependencies before proceeding
        const unmetDependencies = step.dependencies.filter(dep => 
          workflow.steps.find(s => s.step === dep)?.tasks.some(taskDesc => 
            !workflow.tasks.some(t => t.description === taskDesc && t.status === 'completed')
          )
        );
        
        if (unmetDependencies.length > 0) {
          return {
            success: false,
            message: `Step ${step.step} has unmet dependencies: ${unmetDependencies.join(', ')}`,
            errors: [`Dependencies not met: ${unmetDependencies.join(', ')}`],
          };
        }
        
        console.log(`✓ Step ${step.step} completed successfully`);
      }
      
      workflow.status = 'completed';
      
      // Final validation before considering workflow complete
      if (workflow.name.includes('Create Feature')) {
        console.log('\n=== Final Validation ===');
        const validation = this.gitWorkflow.validateForMerge();
        
        if (!validation.valid) {
          return {
            success: false,
            message: `Workflow completed but validation failed: ${validation.errors.join(', ')}`,
            errors: validation.errors,
            warnings: validation.warnings,
            nextSteps: validation.suggestions,
          };
        }
        
        console.log('✓ All validations passed');
        console.log('✓ Ready for merge to main');
      }
      
      return {
        success: true,
        message: `Workflow "${workflow.name}" completed successfully`,
        nextSteps: this.generateNextSteps(workflow),
      };
      
    } catch (error) {
      workflow.status = 'failed';
      
      return {
        success: false,
        message: `Workflow failed: ${error instanceof Error ? error.message : String(error)}`,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
  
  private async executeAgentTask(
    taskDescription: string, 
    agentType: WorkflowStep['agentType'],
    workflow: DevelopmentWorkflow
  ): Promise<{
    success: boolean;
    message: string;
    details?: any;
    errors?: string[];
    warnings?: string[];
  }> {
    try {
      // Map agent type to Opencode agent name
      const agentMap: Record<WorkflowStep['agentType'], string> = {
        'development': 'blackmamba-development',
        'htmx': 'blackmamba-htmx',
        'database': 'blackmamba-database',
        'testing': 'blackmamba-testing',
        'auth': 'blackmamba-auth',
        'api': 'blackmamba-api',
        'analysis': 'blackmamba-development', // Analysis uses development agent
        'git': 'blackmamba-development', // Git operations use development agent
        'web-designer': 'blackmamba-web-designer',
      };
      
      const agentName = agentMap[agentType];
      
      // Prepare context for the agent
      const context = {
        workflowId: workflow.id,
        workflowName: workflow.name,
        featureName: workflow.name.includes('Create Feature') ? 
          workflow.name.match(/Create Feature: (.+)/)?.[1] : undefined,
        projectRoot: this.context.projectRoot,
        currentStep: workflow.currentStep,
        taskDescription,
      };
      
      console.log(`Invoking ${agentName} for: ${taskDescription}`);
      
      // In a real implementation, this would use the Task tool
      // For now, simulate with appropriate responses based on agent type
      await this.delay(500); // Simulate agent execution time
      
       // Simulate different outcomes based on agent type and task
      if (agentType === 'testing' && taskDescription.includes('test')) {
        // Simulate test execution with domain-specific failures
        const testPasses = Math.random() > 0.5; // 50% pass rate for simulation to test failure handling
        
        if (!testPasses) {
          // Generate domain-specific test failures based on task description
          const lowerTask = taskDescription.toLowerCase();
          
          let failureDetails: any;
          let failureMessage: string;
          
          if (lowerTask.includes('api') || lowerTask.includes('endpoint')) {
            // API test failure
            failureMessage = 'API tests failed: Endpoint validation errors';
            failureDetails = {
              passed: 8,
              failed: 3,
              errors: 1,
              failures: [
                'POST /api/v1/users should return 400 for invalid email',
                'GET /api/v1/users/:id should return 404 for non-existent user',
                'PUT /api/v1/users/:id should validate request body',
              ],
              stack: 'at ApiRouter.handleUserEndpoint (src/features/users/api/v1/users.api.ts:42)',
              message: 'API endpoint validation failed: Missing required fields',
            };
          } else if (lowerTask.includes('htmx') || lowerTask.includes('fragment')) {
            // HTMX test failure
            failureMessage = 'HTMX fragment tests failed: Rendering errors';
            failureDetails = {
              passed: 12,
              failed: 2,
              errors: 0,
              failures: [
                'UserProfileFragment should render user avatar correctly',
                'ShoppingCartFragment should update item count dynamically',
              ],
              stack: 'at FragmentRenderer.renderProfile (src/features/users/fragments/profile.fragment.ts:78)',
              message: 'HTML rendering failed: Missing required template variables',
            };
          } else if (lowerTask.includes('database') || lowerTask.includes('prisma')) {
            // Database test failure
            failureMessage = 'Database tests failed: Query execution errors';
            failureDetails = {
              passed: 10,
              failed: 2,
              errors: 1,
              failures: [
                'UserRepository.findByEmail should handle null results',
                'ProductRepository.getAll should implement pagination',
              ],
              stack: 'at PrismaClient.executeQuery (node_modules/@prisma/client/runtime/index.js:123)',
              message: 'Database query failed: Unique constraint violation',
            };
          } else if (lowerTask.includes('auth') || lowerTask.includes('authentication')) {
            // Auth test failure
            failureMessage = 'Authentication tests failed: Security validation errors';
            failureDetails = {
              passed: 7,
              failed: 2,
              errors: 0,
              failures: [
                'LoginHandler should validate password strength',
                'SessionMiddleware should expire tokens after timeout',
              ],
              stack: 'at PassportStrategy.authenticate (src/infrastructure/auth/passport/local.strategy.ts:56)',
              message: 'Authentication failed: Invalid credentials or expired session',
            };
          } else {
            // General/development test failure (default)
            failureMessage = 'Tests failed: 2 assertions failed, 1 error encountered';
            failureDetails = {
              passed: 15,
              failed: 2,
              errors: 1,
              failures: [
                'UserService.createUser should validate email format',
                'AuthMiddleware.authenticate should reject expired tokens',
              ],
              stack: 'at UserService.validateUserData (src/core/services/user.service.ts:89)',
              message: 'Business logic validation failed: Invalid user data',
            };
          }
          
          return {
            success: false,
            message: failureMessage,
            details: failureDetails,
            errors: ['Test failures detected'],
            warnings: ['Consider adding more test cases for edge conditions'],
          };
        }
        
        return {
          success: true,
          message: 'All tests passed successfully',
          details: {
            passed: 18,
            failed: 0,
            errors: 0,
            coverage: '92%',
          },
        };
      }
      
      // Default success for other agents
      return {
        success: true,
        message: `Task completed by ${agentName}`,
        details: {
          agent: agentName,
          task: taskDescription,
          timestamp: new Date().toISOString(),
        },
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Agent execution failed: ${error instanceof Error ? error.message : String(error)}`,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
  
  private generateNextSteps(workflow: DevelopmentWorkflow): string[] {
    const nextSteps: string[] = [];
    
    if (workflow.name.includes('Create Feature')) {
      nextSteps.push('Test the new feature thoroughly');
      nextSteps.push('Update documentation for the new feature');
      nextSteps.push('Consider adding additional functionality based on user feedback');
    } else if (workflow.name.includes('Project Analysis')) {
      const analysis = this.context.analysis;
      
      if (analysis.violations.length > 0) {
        nextSteps.push('Run "Fix Framework Violations" workflow to address identified issues');
      }
      
      if (analysis.agentSuggestions.development.length > 0) {
        nextSteps.push('Consider running Development Agent tasks for business logic improvements');
      }
      
      if (analysis.agentSuggestions.htmx.length > 0) {
        nextSteps.push('Consider running HTMX Agent tasks for UI improvements');
      }
    }
    
    nextSteps.push('Run additional analysis to verify improvements');
    nextSteps.push('Consider running comprehensive test suite');
    
    return nextSteps;
  }
  
  private detectFailureDomain(
    taskDescription: string, 
    failureDetails: any
  ): WorkflowStep['agentType'] {
    // Analyze task description and failure details to determine which agent should fix it
    
    const lowerTask = taskDescription.toLowerCase();
    const failureMessage = failureDetails?.message?.toLowerCase() || '';
    const failureStack = failureDetails?.stack?.toLowerCase() || '';
    
    // Check for API-related failures
    if (
      lowerTask.includes('api') ||
      lowerTask.includes('endpoint') ||
      lowerTask.includes('rest') ||
      failureMessage.includes('api') ||
      failureMessage.includes('endpoint') ||
      failureMessage.includes('status code') ||
      failureMessage.includes('response') ||
      failureStack.includes('api') ||
      failureStack.includes('router') ||
      failureStack.includes('route')
    ) {
      return 'api';
    }
    
    // Check for HTMX/UI-related failures
    if (
      lowerTask.includes('htmx') ||
      lowerTask.includes('fragment') ||
      lowerTask.includes('component') ||
      lowerTask.includes('ui') ||
      lowerTask.includes('render') ||
      lowerTask.includes('html') ||
      failureMessage.includes('htmx') ||
      failureMessage.includes('fragment') ||
      failureMessage.includes('component') ||
      failureMessage.includes('render') ||
      failureMessage.includes('html') ||
      failureStack.includes('htmx') ||
      failureStack.includes('fragment') ||
      failureStack.includes('template')
    ) {
      return 'htmx';
    }
    
    // Check for database-related failures
    if (
      lowerTask.includes('database') ||
      lowerTask.includes('prisma') ||
      lowerTask.includes('schema') ||
      lowerTask.includes('migration') ||
      lowerTask.includes('repository') ||
      lowerTask.includes('query') ||
      failureMessage.includes('database') ||
      failureMessage.includes('prisma') ||
      failureMessage.includes('schema') ||
      failureMessage.includes('migration') ||
      failureMessage.includes('query') ||
      failureMessage.includes('sql') ||
      failureStack.includes('prisma') ||
      failureStack.includes('database') ||
      failureStack.includes('repository')
    ) {
      return 'database';
    }
    
    // Check for authentication-related failures
    if (
      lowerTask.includes('auth') ||
      lowerTask.includes('authentication') ||
      lowerTask.includes('authorization') ||
      lowerTask.includes('login') ||
      lowerTask.includes('session') ||
      lowerTask.includes('rbac') ||
      lowerTask.includes('permission') ||
      failureMessage.includes('auth') ||
      failureMessage.includes('authentication') ||
      failureMessage.includes('authorization') ||
      failureMessage.includes('unauthorized') ||
      failureMessage.includes('forbidden') ||
      failureStack.includes('auth') ||
      failureStack.includes('passport') ||
      failureStack.includes('session')
    ) {
      return 'auth';
    }
    
    // Check for core business logic failures (development agent)
    if (
      lowerTask.includes('unit test') ||
      lowerTask.includes('business logic') ||
      lowerTask.includes('service') ||
      lowerTask.includes('domain') ||
      lowerTask.includes('core') ||
      failureMessage.includes('business logic') ||
      failureMessage.includes('service') ||
      failureMessage.includes('domain') ||
      failureMessage.includes('validation') ||
      failureStack.includes('service') ||
      failureStack.includes('domain')
    ) {
      return 'development';
    }
    
    // Default to development agent for general test failures
    return 'development';
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getCurrentWorkflow(): DevelopmentWorkflow | undefined {
    if (!this.currentWorkflowId) return undefined;
    return this.workflows.get(this.currentWorkflowId);
  }
  
  getAllWorkflows(): DevelopmentWorkflow[] {
    return Array.from(this.workflows.values());
  }
}