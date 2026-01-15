import { BlackMambaProjectAnalyzer, ProjectAnalysis } from './project-analyzer';

export interface AgentContext {
  projectRoot: string;
  analysis: ProjectAnalysis;
  currentFeature?: string;
  taskDescription: string;
  dependencies: {
    development?: string[];
    htmx?: string[];
    database?: string[];
    testing?: string[];
  };
}

export interface AgentTask {
  id: string;
  description: string;
  agentType: 'development' | 'htmx' | 'database' | 'testing' | 'auth' | 'api' | 'analysis' | 'git' | 'web-designer' | 'performance' | 'security' | 'documentation' | 'deployment';
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  tasksCompleted: AgentTask[];
  nextSteps?: string[];
  warnings?: string[];
  errors?: string[];
}

export abstract class BaseAgent {
  protected analyzer: BlackMambaProjectAnalyzer;
  protected context: AgentContext;
  
  constructor(projectRoot: string = process.cwd()) {
    this.analyzer = new BlackMambaProjectAnalyzer(projectRoot);
    this.context = {
      projectRoot,
      analysis: this.analyzer.analyze(),
      taskDescription: '',
      dependencies: {},
    };
  }
  
  abstract execute(taskDescription: string): Promise<AgentResponse>;
  
  protected updateContext(newContext: Partial<AgentContext>): void {
    this.context = { ...this.context, ...newContext };
  }
  
  protected analyzeProject(): ProjectAnalysis {
    this.context.analysis = this.analyzer.analyze();
    return this.context.analysis;
  }
  
  protected formatAnalysis(): string {
    return this.analyzer.formatAnalysis(this.context.analysis);
  }
  
  protected validateFrameworkCompliance(): string[] {
    const violations = this.context.analysis.violations;
    if (violations.length === 0) {
      return [];
    }
    
    return violations.map(v => 
      `Violation at ${v.path}: ${v.message}. Recommendation: ${v.recommendation}`
    );
  }
  
  protected createTask(
    description: string,
    agentType: AgentTask['agentType'],
    priority: AgentTask['priority'] = 'medium',
    dependencies: string[] = []
  ): AgentTask {
    return {
      id: `${agentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description,
      agentType,
      priority,
      dependencies,
      status: 'pending',
    };
  }
  
  protected markTaskComplete(task: AgentTask, result?: any): AgentTask {
    return {
      ...task,
      status: 'completed',
      result,
    };
  }
  
  protected markTaskFailed(task: AgentTask, error: string): AgentTask {
    return {
      ...task,
      status: 'failed',
      result: { error },
    };
  }
  
  protected getFeaturePath(featureName: string): string {
    return `${this.context.projectRoot}/src/features/${featureName}`;
  }
  
  protected ensureFeatureStructure(featureName: string): void {
    const featurePath = this.getFeaturePath(featureName);
    const directories = ['core', 'fragments', 'api', 'components', 'tests'];
    
    // This would be implemented with actual file system operations
    // For now, it's a placeholder for the pattern
    console.log(`Ensuring feature structure for ${featureName} at ${featurePath}`);
  }
  
  protected getFrameworkPatterns(): Record<string, string> {
    return {
      coreBusinessLogic: 'Framework-agnostic business logic in /core/ or /features/{feature}/core/',
      repositoryPattern: 'Repository interfaces in core, implementations in infrastructure',
      resultPattern: 'Result<T, E> for error handling in service methods',
      dependencyInjection: 'Use dependency injection for loose coupling',
      htmxFragments: 'HTMX fragments return HTML only, use middleware helpers',
      featureModules: 'Self-contained features with core, fragments, api, components',
      testingStrategy: 'Unit tests for core, fragment tests for HTML, E2E for user flows',
    };
  }
}