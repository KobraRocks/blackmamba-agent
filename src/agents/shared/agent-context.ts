import { CSSVariable, CSSComponent } from '../web-designer/web-designer-agent';

export interface SharedDesignContext {
  // Component information
  componentName: string;
  featureName: string;
  
  // CSS/Design context
  cssVariables: Record<string, CSSVariable>;
  customTags: string[];
  cssComponents: CSSComponent[];
  
  // HTMX/Fragment context
  htmxFragments: string[];
  fragmentPaths: Record<string, string>;
  componentStructure: Record<string, any>;
  
  // Responsive design
  responsiveBreakpoints: string[];
  mobileFirst: boolean;
  
  // Accessibility requirements
  accessibilityFeatures: string[];
  ariaRequirements: string[];
  
  // Collaboration data
  collaborationStatus: {
    htmxReady: boolean;
    cssReady: boolean;
    integrationComplete: boolean;
  };
  
  // Shared configuration
  sharedConfig: {
    cssFilePath: string;
    fragmentDirectory: string;
    variablePrefix: string;
  };
}

export interface AgentCollaborationMessage {
  from: 'htmx' | 'web-designer' | 'master';
  to: 'htmx' | 'web-designer' | 'master' | 'all';
  type: 'request' | 'response' | 'update' | 'error';
  payload: any;
  timestamp: Date;
}

export class AgentContextManager {
  private static instance: AgentContextManager;
  private contexts: Map<string, SharedDesignContext> = new Map();
  private messageQueue: AgentCollaborationMessage[] = [];
  
  private constructor() {}
  
  public static getInstance(): AgentContextManager {
    if (!AgentContextManager.instance) {
      AgentContextManager.instance = new AgentContextManager();
    }
    return AgentContextManager.instance;
  }
  
  // Context Management
  public createContext(componentName: string, featureName: string): SharedDesignContext {
    const context: SharedDesignContext = {
      componentName,
      featureName,
      cssVariables: {},
      customTags: [],
      cssComponents: [],
      htmxFragments: [],
      fragmentPaths: {},
      componentStructure: {},
      responsiveBreakpoints: ['mobile', 'tablet', 'desktop'],
      mobileFirst: true,
      accessibilityFeatures: ['focus-visible', 'high-contrast', 'keyboard-navigation'],
      ariaRequirements: [],
      collaborationStatus: {
        htmxReady: false,
        cssReady: false,
        integrationComplete: false,
      },
      sharedConfig: {
        cssFilePath: '/public/css/blackmamba.css',
        fragmentDirectory: 'src/features/{feature}/fragments',
        variablePrefix: '--{component}',
      },
    };
    
    this.contexts.set(componentName, context);
    return context;
  }
  
  public getContext(componentName: string): SharedDesignContext | undefined {
    return this.contexts.get(componentName);
  }
  
  public updateContext(componentName: string, updates: Partial<SharedDesignContext>): void {
    const context = this.contexts.get(componentName);
    if (context) {
      Object.assign(context, updates);
    }
  }
  
  // CSS Variable Management
  public addCSSVariable(componentName: string, variable: CSSVariable): void {
    const context = this.contexts.get(componentName);
    if (context) {
      context.cssVariables[variable.name] = variable;
    }
  }
  
  public getCSSVariables(componentName: string): CSSVariable[] {
    const context = this.contexts.get(componentName);
    return context ? Object.values(context.cssVariables) : [];
  }
  
  // Custom Tag Management
  public registerCustomTag(componentName: string, tagName: string): void {
    const context = this.contexts.get(componentName);
    if (context && !context.customTags.includes(tagName)) {
      context.customTags.push(tagName);
    }
  }
  
  // HTMX Fragment Management
  public registerHTMXFragment(componentName: string, fragmentName: string, path: string): void {
    const context = this.contexts.get(componentName);
    if (context) {
      context.htmxFragments.push(fragmentName);
      context.fragmentPaths[fragmentName] = path;
    }
  }
  
  // Collaboration Status
  public markHTMXReady(componentName: string): void {
    const context = this.contexts.get(componentName);
    if (context) {
      context.collaborationStatus.htmxReady = true;
    }
  }
  
  public markCSSReady(componentName: string): void {
    const context = this.contexts.get(componentName);
    if (context) {
      context.collaborationStatus.cssReady = true;
    }
  }
  
  public markIntegrationComplete(componentName: string): void {
    const context = this.contexts.get(componentName);
    if (context) {
      context.collaborationStatus.integrationComplete = true;
    }
  }
  
  public isReadyForIntegration(componentName: string): boolean {
    const context = this.contexts.get(componentName);
    return context 
      ? context.collaborationStatus.htmxReady && context.collaborationStatus.cssReady
      : false;
  }
  
  // Message Queue for Agent Communication
  public sendMessage(message: AgentCollaborationMessage): void {
    this.messageQueue.push(message);
    console.log(`Message from ${message.from} to ${message.to}: ${message.type}`);
  }
  
  public getMessages(forAgent: string): AgentCollaborationMessage[] {
    return this.messageQueue.filter(msg => 
      msg.to === forAgent || msg.to === 'all'
    );
  }
  
  public clearMessages(forAgent: string): void {
    this.messageQueue = this.messageQueue.filter(msg => 
      msg.to !== forAgent && msg.to !== 'all'
    );
  }
  
  // Helper methods for common collaboration patterns
  public requestCSSVariables(componentName: string, fromAgent: string): void {
    this.sendMessage({
      from: fromAgent as any,
      to: 'web-designer',
      type: 'request',
      payload: {
        componentName,
        requestType: 'css-variables',
      },
      timestamp: new Date(),
    });
  }
  
  public provideCSSVariables(componentName: string, variables: CSSVariable[]): void {
    this.sendMessage({
      from: 'web-designer',
      to: 'htmx',
      type: 'response',
      payload: {
        componentName,
        responseType: 'css-variables',
        variables,
      },
      timestamp: new Date(),
    });
  }
  
  public requestCustomTags(componentName: string, fromAgent: string): void {
    this.sendMessage({
      from: fromAgent as any,
      to: 'web-designer',
      type: 'request',
      payload: {
        componentName,
        requestType: 'custom-tags',
      },
      timestamp: new Date(),
    });
  }
  
  public provideCustomTags(componentName: string, tags: string[]): void {
    this.sendMessage({
      from: 'web-designer',
      to: 'htmx',
      type: 'response',
      payload: {
        componentName,
        responseType: 'custom-tags',
        tags,
      },
      timestamp: new Date(),
    });
  }
  
  public notifyStructureReady(componentName: string, fromAgent: string, structure: any): void {
    this.sendMessage({
      from: fromAgent as any,
      to: fromAgent === 'htmx' ? 'web-designer' : 'htmx',
      type: 'update',
      payload: {
        componentName,
        updateType: 'structure-ready',
        structure,
        agent: fromAgent,
      },
      timestamp: new Date(),
    });
  }
  
  // Validation helpers
  public validateComponentConsistency(componentName: string): string[] {
    const context = this.contexts.get(componentName);
    const errors: string[] = [];
    
    if (!context) {
      return ['Component context not found'];
    }
    
    // Check if custom tags are used in CSS
    context.customTags.forEach(tag => {
      // In production, this would check actual CSS files
      console.log(`Validating custom tag: ${tag}`);
    });
    
    // Check if CSS variables are referenced
    Object.values(context.cssVariables).forEach(variable => {
      console.log(`Validating CSS variable: ${variable.name}`);
    });
    
    return errors;
  }
  
  // Generate collaboration summary
  public getCollaborationSummary(componentName: string): string {
    const context = this.contexts.get(componentName);
    if (!context) {
      return 'No context found for component';
    }
    
    return `
Component: ${context.componentName}
Feature: ${context.featureName}

CSS Variables: ${Object.keys(context.cssVariables).length}
Custom Tags: ${context.customTags.length}
HTMX Fragments: ${context.htmxFragments.length}

Collaboration Status:
- HTMX Ready: ${context.collaborationStatus.htmxReady}
- CSS Ready: ${context.collaborationStatus.cssReady}
- Integration Complete: ${context.collaborationStatus.integrationComplete}

Responsive Breakpoints: ${context.responsiveBreakpoints.join(', ')}
Accessibility Features: ${context.accessibilityFeatures.join(', ')}
`;
  }
}