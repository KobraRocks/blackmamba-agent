import { BaseAgent, AgentContext, AgentResponse, AgentTask } from '../shared/agent-base';
import { ProjectAnalysis } from '../shared/project-analyzer';
import { AgentContextManager, SharedDesignContext } from '../shared/agent-context';

export interface CSSVariable {
  name: string;
  value: string;
  description: string;
  category: 'color' | 'spacing' | 'typography' | 'border' | 'shadow' | 'component';
}

export interface CSSComponent {
  name: string;
  tagName: string;
  variables: CSSVariable[];
  styles: string;
  responsiveBreakpoints: string[];
  accessibilityFeatures: string[];
}

export interface DesignContext {
  componentName: string;
  cssVariables: Record<string, CSSVariable>;
  customTags: string[];
  responsiveBreakpoints: string[];
  accessibilityRequirements: string[];
  collaborationData?: {
    htmxFragmentPath?: string;
    sharedVariables?: string[];
    integrationPoints?: string[];
  };
}

export class WebDesignerAgent extends BaseAgent {
  private designContext: DesignContext | null = null;
  private cssComponents: Map<string, CSSComponent> = new Map();
  private cssVariables: Map<string, CSSVariable> = new Map();
  private contextManager: AgentContextManager;

  constructor(projectRoot: string = process.cwd()) {
    super(projectRoot);
    this.contextManager = AgentContextManager.getInstance();
    this.initializeDefaultVariables();
  }

  async execute(taskDescription: string): Promise<AgentResponse> {
    this.updateContext({ taskDescription });
    
    console.log('Web Designer Agent executing task:', taskDescription);
    
    // Parse the task to determine action
    const lowerTask = taskDescription.toLowerCase();
    
    if (lowerTask.includes('create css') || lowerTask.includes('style component')) {
      return await this.createCSSComponent(taskDescription);
    } else if (lowerTask.includes('variable') || lowerTask.includes('theme')) {
      return await this.manageCSSVariables(taskDescription);
    } else if (lowerTask.includes('validate') || lowerTask.includes('check')) {
      return await this.validateCSSConsistency(taskDescription);
    } else if (lowerTask.includes('collaborate') || lowerTask.includes('with htmx')) {
      return await this.collaborateWithHTMX(taskDescription);
    } else {
      return await this.genericDesignTask(taskDescription);
    }
  }

  private async createCSSComponent(taskDescription: string): Promise<AgentResponse> {
    // Extract component name from task
    const componentMatch = taskDescription.match(/component\s+["']?([^"'\s]+)["']?/i) ||
                          taskDescription.match(/create\s+["']?([^"'\s]+)["']?/i);
    const componentName = componentMatch ? componentMatch[1] : 'new-component';
    
    // Create CSS component following BlackMamba patterns
    const component = this.generateCSSComponent(componentName, taskDescription);
    this.cssComponents.set(componentName, component);
    
    // Generate CSS file content
    const cssContent = this.generateCSSFile(component);
    
    // Determine where to save CSS
    const cssPath = this.getCSSFilePath();
    
    // Create or update CSS file
    const fileTask = await this.createOrUpdateCSSFile(cssPath, cssContent);
    
    return {
      success: true,
      message: `Created CSS component '${componentName}' following BlackMamba patterns`,
      tasksCompleted: [fileTask],
      nextSteps: [
        'Share CSS variables with HTMX agent',
        'Validate component styling consistency',
        'Test responsive behavior'
      ],
      warnings: [],
      errors: [],
    };
  }

  private generateCSSComponent(name: string, requirements: string): CSSComponent {
    // Generate kebab-case tag name
    const tagName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Create component-specific variables
    const variables: CSSVariable[] = [
      {
        name: `--${tagName}-bg`,
        value: 'var(--primary-color, #007bff)',
        description: `Background color for ${name} component`,
        category: 'color'
      },
      {
        name: `--${tagName}-text`,
        value: 'var(--text-color, #333)',
        description: `Text color for ${name} component`,
        category: 'color'
      },
      {
        name: `--${tagName}-padding`,
        value: 'var(--spacing-md, 1rem)',
        description: `Padding for ${name} component`,
        category: 'spacing'
      }
    ];

    // Generate CSS styles following BlackMamba patterns
    const styles = this.generateComponentStyles(tagName, variables);

    return {
      name,
      tagName,
      variables,
      styles,
      responsiveBreakpoints: ['mobile', 'tablet', 'desktop'],
      accessibilityFeatures: ['focus-visible', 'high-contrast', 'keyboard-navigation']
    };
  }

  private generateComponentStyles(tagName: string, variables: CSSVariable[]): string {
    const internalVars = variables.map(v => `\t${v.name}: ${v.value};`).join('\n');
    
    return `${tagName} {\n` +
           `\t/* Internal variables referencing globals */\n` +
           `${internalVars}\n\n` +
           `\t/* Component styling */\n` +
           `\tbackground: var(--${tagName}-bg);\n` +
           `\tcolor: var(--${tagName}-text);\n` +
           `\tpadding: var(--${tagName}-padding);\n` +
           `\tborder-radius: var(--radius-md, 0.5rem);\n` +
           `\tbox-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.12));\n\n` +
           `\t/* Responsive design */\n` +
           `\t@media (max-width: 768px) {\n` +
           `\t\tpadding: var(--spacing-sm, 0.5rem);\n` +
           `\t}\n\n` +
           `\t/* Accessibility */\n` +
           `\t&:focus-visible {\n` +
           `\t\toutline: 2px solid var(--focus-color, #0056b3);\n` +
           `\t\toutline-offset: 2px;\n` +
           `\t}\n` +
           `}`;
  }

  private generateCSSFile(component: CSSComponent): string {
    const rootVariables = Array.from(this.cssVariables.values())
      .map(v => `\t${v.name}: ${v.value}; /* ${v.description} */`)
      .join('\n');

    const componentVariables = component.variables
      .map(v => `\t${v.name}: ${v.value}; /* ${v.description} */`)
      .join('\n');

    return `/* BlackMamba CSS - Generated by Web Designer Agent */\n` +
           `/* Follows BlackMamba CSS philosophy: single file, variables, components */\n\n` +
           `:root {\n` +
           `\t/* Global design variables */\n` +
           `${rootVariables}\n\n` +
           `\t/* Component-specific variables */\n` +
           `${componentVariables}\n` +
           `}\n\n` +
           `/* ${component.name} Component */\n` +
           `${component.styles}\n\n` +
           `/* Responsive utilities */\n` +
           `@media (max-width: 768px) {\n` +
           `\t:root {\n` +
           `\t\t--spacing-md: 0.75rem;\n` +
           `\t\t--spacing-lg: 1rem;\n` +
           `\t}\n` +
           `}\n\n` +
           `@media (prefers-color-scheme: dark) {\n` +
           `\t:root {\n` +
           `\t\t--primary-color: #0056b3;\n` +
           `\t\t--text-color: #f0f0f0;\n` +
           `\t\t--bg-color: #1a1a1a;\n` +
           `\t}\n` +
           `}`;
  }

  private initializeDefaultVariables(): void {
    const defaultVars: CSSVariable[] = [
      {
        name: '--primary-color',
        value: '#007bff',
        description: 'Primary brand color',
        category: 'color'
      },
      {
        name: '--secondary-color',
        value: '#6c757d',
        description: 'Secondary brand color',
        category: 'color'
      },
      {
        name: '--text-color',
        value: '#333',
        description: 'Default text color',
        category: 'color'
      },
      {
        name: '--bg-color',
        value: '#fff',
        description: 'Default background color',
        category: 'color'
      },
      {
        name: '--spacing-xs',
        value: '0.25rem',
        description: 'Extra small spacing',
        category: 'spacing'
      },
      {
        name: '--spacing-sm',
        value: '0.5rem',
        description: 'Small spacing',
        category: 'spacing'
      },
      {
        name: '--spacing-md',
        value: '1rem',
        description: 'Medium spacing',
        category: 'spacing'
      },
      {
        name: '--spacing-lg',
        value: '1.5rem',
        description: 'Large spacing',
        category: 'spacing'
      },
      {
        name: '--radius-sm',
        value: '0.25rem',
        description: 'Small border radius',
        category: 'border'
      },
      {
        name: '--radius-md',
        value: '0.5rem',
        description: 'Medium border radius',
        category: 'border'
      },
      {
        name: '--radius-lg',
        value: '1rem',
        description: 'Large border radius',
        category: 'border'
      },
      {
        name: '--shadow-sm',
        value: '0 1px 3px rgba(0,0,0,0.12)',
        description: 'Small shadow',
        category: 'shadow'
      },
      {
        name: '--shadow-md',
        value: '0 4px 6px rgba(0,0,0,0.1)',
        description: 'Medium shadow',
        category: 'shadow'
      },
      {
        name: '--shadow-lg',
        value: '0 10px 15px rgba(0,0,0,0.1)',
        description: 'Large shadow',
        category: 'shadow'
      },
      {
        name: '--font-size-sm',
        value: '0.875rem',
        description: 'Small font size',
        category: 'typography'
      },
      {
        name: '--font-size-md',
        value: '1rem',
        description: 'Medium font size',
        category: 'typography'
      },
      {
        name: '--font-size-lg',
        value: '1.25rem',
        description: 'Large font size',
        category: 'typography'
      },
      {
        name: '--font-size-xl',
        value: '1.5rem',
        description: 'Extra large font size',
        category: 'typography'
      }
    ];

    defaultVars.forEach(variable => {
      this.cssVariables.set(variable.name, variable);
    });
  }

  private getCSSFilePath(): string {
    // Check for existing CSS structure
    const fs = require('fs');
    const path = require('path');
    
    // Check for public directory
    const publicDir = path.join(this.context.projectRoot, 'public');
    if (fs.existsSync(publicDir)) {
      return path.join(publicDir, 'css', 'blackmamba.css');
    }
    
    // Check for src directory
    const srcDir = path.join(this.context.projectRoot, 'src');
    if (fs.existsSync(srcDir)) {
      return path.join(srcDir, 'css', 'blackmamba.css');
    }
    
    // Default to project root
    return path.join(this.context.projectRoot, 'blackmamba.css');
  }

  private async createOrUpdateCSSFile(path: string, content: string): Promise<AgentTask> {
    const fs = require('fs');
    const pathModule = require('path');
    
    // Ensure directory exists
    const dir = pathModule.dirname(path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Read existing content if file exists
    let existingContent = '';
    if (fs.existsSync(path)) {
      existingContent = fs.readFileSync(path, 'utf8');
    }
    
    // Merge or create new content
    const finalContent = existingContent 
      ? this.mergeCSSContent(existingContent, content)
      : content;
    
    // Write file
    fs.writeFileSync(path, finalContent, 'utf8');
    
    return {
      id: `css-file-${Date.now()}`,
      description: `Created/updated CSS file at ${path}`,
      agentType: 'web-designer',
      priority: 'medium',
      status: 'completed',
      result: `CSS file updated with BlackMamba patterns`
    };
  }

  private mergeCSSContent(existing: string, newContent: string): string {
    // Simple merge: append new component styles
    // In production, this would be more sophisticated
    return existing + '\n\n' + newContent.split(':root')[1];
  }

  private async manageCSSVariables(taskDescription: string): Promise<AgentResponse> {
    // Implementation for variable management
    return {
      success: true,
      message: 'CSS variable management not yet implemented',
      tasksCompleted: [],
      nextSteps: [],
      warnings: [],
      errors: [],
    };
  }

  private async validateCSSConsistency(taskDescription: string): Promise<AgentResponse> {
    // Implementation for CSS validation
    return {
      success: true,
      message: 'CSS consistency validation not yet implemented',
      tasksCompleted: [],
      nextSteps: [],
      warnings: [],
      errors: [],
    };
  }

  private async collaborateWithHTMX(taskDescription: string): Promise<AgentResponse> {
    // Extract component name from task
    const componentMatch = taskDescription.match(/component\s+["']?([^"'\s]+)["']?/i) ||
                          taskDescription.match(/with\s+["']?([^"'\s]+)["']?/i);
    const componentName = componentMatch ? componentMatch[1] : 'unknown-component';
    
    // Get or create shared context
    let sharedContext = this.contextManager.getContext(componentName);
    if (!sharedContext) {
      sharedContext = this.contextManager.createContext(componentName, 'unknown-feature');
    }
    
    // Check for messages from HTMX agent
    const messages = this.contextManager.getMessages('web-designer');
    const htmxMessages = messages.filter(msg => msg.from === 'htmx');
    
    const tasks: AgentTask[] = [];
    
    // Process HTMX messages
    htmxMessages.forEach(message => {
      switch (message.payload?.requestType) {
        case 'css-variables':
          // Provide CSS variables to HTMX
          const variables = this.getCSSVariables();
          this.contextManager.provideCSSVariables(componentName, variables);
          tasks.push(this.createCollaborationTask(
            `Provided CSS variables to HTMX agent for ${componentName}`,
            'medium'
          ));
          break;
          
        case 'custom-tags':
          // Provide custom tags to HTMX
          const tags = this.getCustomTags();
          this.contextManager.provideCustomTags(componentName, tags);
          tasks.push(this.createCollaborationTask(
            `Provided custom tags to HTMX agent for ${componentName}`,
            'medium'
          ));
          break;
          
        case 'structure-ready':
          // HTMX structure is ready, create CSS for it
          const structure = message.payload.structure;
          this.createCSSForStructure(componentName, structure);
          tasks.push(this.createCollaborationTask(
            `Created CSS for HTMX structure of ${componentName}`,
            'high'
          ));
          this.contextManager.markCSSReady(componentName);
          break;
      }
    });
    
    // Clear processed messages
    this.contextManager.clearMessages('web-designer');
    
    // Mark CSS as ready if we have components
    if (this.cssComponents.has(componentName)) {
      this.contextManager.markCSSReady(componentName);
    }
    
    return {
      success: true,
      message: `Collaborated with HTMX agent on ${componentName}`,
      tasksCompleted: tasks,
      nextSteps: [
        'Wait for HTMX to integrate CSS variables',
        'Validate CSS/HTML consistency',
        'Test responsive behavior'
      ],
      warnings: htmxMessages.length === 0 ? ['No messages from HTMX agent'] : [],
      errors: [],
    };
  }
  
  private createCSSForStructure(componentName: string, structure: any): void {
    // Create CSS component based on HTMX structure
    const component = this.generateCSSComponent(componentName, 'From HTMX structure');
    this.cssComponents.set(componentName, component);
    
    // Register custom tags
    this.contextManager.registerCustomTag(componentName, component.tagName);
    
    // Add CSS variables to shared context
    component.variables.forEach(variable => {
      this.contextManager.addCSSVariable(componentName, variable);
    });
    
    // Generate and save CSS
    const cssContent = this.generateCSSFile(component);
    const cssPath = this.getCSSFilePath();
    this.createOrUpdateCSSFile(cssPath, cssContent);
  }
  
  private createCollaborationTask(description: string, priority: 'high' | 'medium' | 'low'): AgentTask {
    const task = this.createTask(description, 'web-designer', priority);
    task.status = 'completed';
    return task;
  }

  private async genericDesignTask(taskDescription: string): Promise<AgentResponse> {
    return {
      success: true,
      message: 'Generic design task completed',
      tasksCompleted: [],
      nextSteps: [],
      warnings: [],
      errors: [],
    };
  }

  // Public API for collaboration
  public getCSSVariables(): CSSVariable[] {
    return Array.from(this.cssVariables.values());
  }

  public getComponentVariables(componentName: string): CSSVariable[] {
    const component = this.cssComponents.get(componentName);
    return component ? component.variables : [];
  }

  public getCustomTags(): string[] {
    return Array.from(this.cssComponents.values()).map(c => c.tagName);
  }

  public setDesignContext(context: DesignContext): void {
    this.designContext = context;
  }
}