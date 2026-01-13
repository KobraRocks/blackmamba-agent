import { BaseAgent, AgentContext, AgentResponse, AgentTask } from '../shared/agent-base';
import { ProjectAnalysis } from '../shared/project-analyzer';
import { GitWorkflowManager, BranchSpec } from '../shared/git-workflow';

export interface WorkflowStep {
  step: number;
  description: string;
  agentType: 'development' | 'htmx' | 'database' | 'testing' | 'auth' | 'api' | 'analysis' | 'git';
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
    this.gitWorkflow = new GitWorkflowManager(projectRoot);
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
          ],
          dependencies: [baseStep + 1, baseStep + 2],
        },
        {
          step: baseStep + 6,
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
          step: baseStep + 7,
          description: 'Create comprehensive tests',
          agentType: 'testing' as const,
          tasks: [
            `Create unit tests for ${featureName} core logic`,
            'Create fragment tests for HTMX components',
            'Create API integration tests',
            'Create E2E tests for user flows',
          ],
          dependencies: [baseStep + 2, baseStep + 5, baseStep + 6],
        },
        {
          step: baseStep + 8,
          description: 'Verify framework compliance',
          agentType: 'analysis' as const,
          tasks: [
            'Verify all code follows BlackMamba patterns',
            'Check directory structure compliance',
            'Validate separation of concerns',
            'Run automated tests',
          ],
          dependencies: [baseStep + 1, baseStep + 2, baseStep + 3, baseStep + 4, baseStep + 5, baseStep + 6, baseStep + 7],
        },
        {
          step: baseStep + 9,
          description: 'Validate and prepare for merge',
          agentType: 'git' as const,
          tasks: [
            'Run final validation checks',
            'Ensure all tests pass',
            'Update documentation',
            'Prepare merge request',
          ],
          dependencies: [baseStep + 8],
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
      for (const step of workflow.steps) {
        if (step.step < workflow.currentStep) continue;
        
        console.log(`Executing step ${step.step}: ${step.description}`);
        
        // Update workflow state
        workflow.currentStep = step.step;
        
        // Execute tasks for this step
        for (const taskDescription of step.tasks) {
          const task = this.createTask(
            taskDescription,
            step.agentType === 'analysis' ? 'development' : step.agentType,
            'medium'
          );
          
          workflow.tasks.push(task);
          
          // Simulate task execution
          console.log(`  Executing task: ${taskDescription}`);
          await this.delay(100); // Simulate work
          
          // Mark task as completed
          const completedTask = this.markTaskComplete(task, { result: 'simulated completion' });
          const taskIndex = workflow.tasks.findIndex(t => t.id === task.id);
          workflow.tasks[taskIndex] = completedTask;
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
      }
      
      workflow.status = 'completed';
      
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