import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, relative } from 'path';

export interface ProjectStructure {
  hasCoreDirectory: boolean;
  hasFeaturesDirectory: boolean;
  hasInfrastructureDirectory: boolean;
  hasSharedDirectory: boolean;
  features: string[];
  coreComponents: string[];
  infrastructureComponents: string[];
  sharedComponents: string[];
  packageJson: any;
  prismaSchemaExists: boolean;
  templateEngine: string;
  testFramework: string;
}

export interface FrameworkViolation {
  type: 'directory' | 'file' | 'pattern' | 'dependency';
  path: string;
  message: string;
  recommendation: string;
}

export interface ProjectAnalysis {
  structure: ProjectStructure;
  violations: FrameworkViolation[];
  recommendations: string[];
  agentSuggestions: {
    development: string[];
    htmx: string[];
    database: string[];
    testing: string[];
  };
}

export class BlackMambaProjectAnalyzer {
  private projectRoot: string;
  
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }
  
  analyze(): ProjectAnalysis {
    const structure = this.analyzeStructure();
    const violations = this.findViolations(structure);
    const recommendations = this.generateRecommendations(structure, violations);
    const agentSuggestions = this.generateAgentSuggestions(structure, violations);
    
    return {
      structure,
      violations,
      recommendations,
      agentSuggestions,
    };
  }
  
  private analyzeStructure(): ProjectStructure {
    const srcPath = join(this.projectRoot, 'src');
    const hasSrc = existsSync(srcPath);
    
    if (!hasSrc) {
      return this.getEmptyStructure();
    }
    
    return {
      hasCoreDirectory: existsSync(join(srcPath, 'core')),
      hasFeaturesDirectory: existsSync(join(srcPath, 'features')),
      hasInfrastructureDirectory: existsSync(join(srcPath, 'infrastructure')),
      hasSharedDirectory: existsSync(join(srcPath, 'shared')),
      features: this.getFeatures(),
      coreComponents: this.getDirectoryComponents('core'),
      infrastructureComponents: this.getDirectoryComponents('infrastructure'),
      sharedComponents: this.getDirectoryComponents('shared'),
      packageJson: this.getPackageJson(),
      prismaSchemaExists: existsSync(join(this.projectRoot, 'prisma/schema.prisma')),
      templateEngine: this.detectTemplateEngine(),
      testFramework: this.detectTestFramework(),
    };
  }
  
  private getEmptyStructure(): ProjectStructure {
    return {
      hasCoreDirectory: false,
      hasFeaturesDirectory: false,
      hasInfrastructureDirectory: false,
      hasSharedDirectory: false,
      features: [],
      coreComponents: [],
      infrastructureComponents: [],
      sharedComponents: [],
      packageJson: {},
      prismaSchemaExists: false,
      templateEngine: 'unknown',
      testFramework: 'unknown',
    };
  }
  
  private getFeatures(): string[] {
    const featuresPath = join(this.projectRoot, 'src/features');
    if (!existsSync(featuresPath)) return [];
    
    try {
      return readdirSync(featuresPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    } catch {
      return [];
    }
  }
  
  private getDirectoryComponents(dirName: string): string[] {
    const dirPath = join(this.projectRoot, 'src', dirName);
    if (!existsSync(dirPath)) return [];
    
    try {
      return readdirSync(dirPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    } catch {
      return [];
    }
  }
  
  private getPackageJson(): any {
    const packageJsonPath = join(this.projectRoot, 'package.json');
    if (!existsSync(packageJsonPath)) return {};
    
    try {
      return JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    } catch {
      return {};
    }
  }
  
  private detectTemplateEngine(): string {
    const packageJson = this.getPackageJson();
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    
    if (dependencies.ejs) return 'ejs';
    if (dependencies.pug) return 'pug';
    if (dependencies.handlebars) return 'handlebars';
    
    return 'unknown';
  }
  
  private detectTestFramework(): string {
    const packageJson = this.getPackageJson();
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    
    if (dependencies.jest) return 'jest';
    if (dependencies.vitest) return 'vitest';
    if (dependencies.mocha) return 'mocha';
    
    return 'unknown';
  }
  
  private findViolations(structure: ProjectStructure): FrameworkViolation[] {
    const violations: FrameworkViolation[] = [];
    
    // Check for missing core directories
    if (!structure.hasCoreDirectory) {
      violations.push({
        type: 'directory',
        path: 'src/core',
        message: 'Missing core directory for framework-agnostic business logic',
        recommendation: 'Create src/core/ directory with domains/, services/, repositories/, events/, errors/ subdirectories',
      });
    }
    
    if (!structure.hasFeaturesDirectory) {
      violations.push({
        type: 'directory',
        path: 'src/features',
        message: 'Missing features directory for feature-based modules',
        recommendation: 'Create src/features/ directory for organizing features',
      });
    }
    
    if (!structure.hasInfrastructureDirectory) {
      violations.push({
        type: 'directory',
        path: 'src/infrastructure',
        message: 'Missing infrastructure directory for framework implementations',
        recommendation: 'Create src/infrastructure/ directory with database/, auth/, http/, templates/ subdirectories',
      });
    }
    
    // Check feature structure
    structure.features.forEach(feature => {
      const featurePath = join(this.projectRoot, 'src/features', feature);
      const hasCore = existsSync(join(featurePath, 'core'));
      const hasFragments = existsSync(join(featurePath, 'fragments'));
      const hasApi = existsSync(join(featurePath, 'api'));
      
      if (!hasCore) {
        violations.push({
          type: 'directory',
          path: `src/features/${feature}/core`,
          message: `Feature "${feature}" missing core directory for business logic`,
          recommendation: `Create src/features/${feature}/core/ directory`,
        });
      }
      
      if (!hasFragments) {
        violations.push({
          type: 'directory',
          path: `src/features/${feature}/fragments`,
          message: `Feature "${feature}" missing fragments directory for HTMX`,
          recommendation: `Create src/features/${feature}/fragments/ directory`,
        });
      }
    });
    
    return violations;
  }
  
  private generateRecommendations(
    structure: ProjectStructure,
    violations: FrameworkViolation[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (violations.length > 0) {
      recommendations.push('Fix directory structure violations to follow BlackMamba patterns');
    }
    
    if (!structure.prismaSchemaExists) {
      recommendations.push('Set up Prisma schema for database management');
    }
    
    if (structure.templateEngine === 'unknown') {
      recommendations.push('Install a template engine (EJS recommended for BlackMamba)');
    }
    
    if (structure.testFramework === 'unknown') {
      recommendations.push('Set up testing framework (Jest recommended for BlackMamba)');
    }
    
    if (structure.features.length === 0) {
      recommendations.push('Create at least one feature module to organize code');
    }
    
    return recommendations;
  }
  
  private generateAgentSuggestions(
    structure: ProjectStructure,
    violations: FrameworkViolation[]
  ): ProjectAnalysis['agentSuggestions'] {
    const suggestions = {
      development: [] as string[],
      htmx: [] as string[],
      database: [] as string[],
      testing: [] as string[],
    };
    
    // Development agent suggestions
    if (!structure.hasCoreDirectory) {
      suggestions.development.push('Create core directory structure for business logic');
    }
    
    if (structure.features.length === 0) {
      suggestions.development.push('Create initial feature module');
    } else {
      structure.features.forEach(feature => {
        const featurePath = join(this.projectRoot, 'src/features', feature);
        if (!existsSync(join(featurePath, 'core'))) {
          suggestions.development.push(`Add core business logic to feature "${feature}"`);
        }
      });
    }
    
    // HTMX agent suggestions
    structure.features.forEach(feature => {
      const featurePath = join(this.projectRoot, 'src/features', feature);
      if (!existsSync(join(featurePath, 'fragments'))) {
        suggestions.htmx.push(`Create HTMX fragments for feature "${feature}"`);
      }
      if (!existsSync(join(featurePath, 'components'))) {
        suggestions.htmx.push(`Create UI components for feature "${feature}"`);
      }
    });
    
    // Database agent suggestions
    if (!structure.prismaSchemaExists) {
      suggestions.database.push('Create Prisma schema and initial models');
    }
    
    if (structure.hasCoreDirectory) {
      const corePath = join(this.projectRoot, 'src/core');
      if (existsSync(join(corePath, 'repositories'))) {
        suggestions.database.push('Implement repository interfaces from core');
      }
    }
    
    // Testing agent suggestions
    if (structure.testFramework !== 'unknown') {
      suggestions.testing.push('Set up test structure for all features');
      structure.features.forEach(feature => {
        suggestions.testing.push(`Create tests for feature "${feature}"`);
      });
    }
    
    return suggestions;
  }
  
  formatAnalysis(analysis: ProjectAnalysis): string {
    let output = '# BlackMamba Project Analysis\n\n';
    
    output += '## Project Structure\n';
    output += `- Core Directory: ${analysis.structure.hasCoreDirectory ? '✅ Present' : '❌ Missing'}\n`;
    output += `- Features Directory: ${analysis.structure.hasFeaturesDirectory ? '✅ Present' : '❌ Missing'}\n`;
    output += `- Infrastructure Directory: ${analysis.structure.hasInfrastructureDirectory ? '✅ Present' : '❌ Missing'}\n`;
    output += `- Shared Directory: ${analysis.structure.hasSharedDirectory ? '✅ Present' : '❌ Missing'}\n`;
    output += `- Features: ${analysis.structure.features.length > 0 ? analysis.structure.features.join(', ') : 'None'}\n`;
    output += `- Template Engine: ${analysis.structure.templateEngine}\n`;
    output += `- Test Framework: ${analysis.structure.testFramework}\n`;
    output += `- Prisma Schema: ${analysis.structure.prismaSchemaExists ? '✅ Present' : '❌ Missing'}\n\n`;
    
    if (analysis.violations.length > 0) {
      output += '## Framework Violations\n';
      analysis.violations.forEach(violation => {
        output += `### ${violation.type.toUpperCase()}: ${violation.path}\n`;
        output += `- **Message**: ${violation.message}\n`;
        output += `- **Recommendation**: ${violation.recommendation}\n\n`;
      });
    }
    
    if (analysis.recommendations.length > 0) {
      output += '## Recommendations\n';
      analysis.recommendations.forEach(rec => {
        output += `- ${rec}\n`;
      });
      output += '\n';
    }
    
    output += '## Agent Suggestions\n';
    
    if (analysis.agentSuggestions.development.length > 0) {
      output += '### Development Agent\n';
      analysis.agentSuggestions.development.forEach(suggestion => {
        output += `- ${suggestion}\n`;
      });
      output += '\n';
    }
    
    if (analysis.agentSuggestions.htmx.length > 0) {
      output += '### HTMX Agent\n';
      analysis.agentSuggestions.htmx.forEach(suggestion => {
        output += `- ${suggestion}\n`;
      });
      output += '\n';
    }
    
    if (analysis.agentSuggestions.database.length > 0) {
      output += '### Database Agent\n';
      analysis.agentSuggestions.database.forEach(suggestion => {
        output += `- ${suggestion}\n`;
      });
      output += '\n';
    }
    
    if (analysis.agentSuggestions.testing.length > 0) {
      output += '### Testing Agent\n';
      analysis.agentSuggestions.testing.forEach(suggestion => {
        output += `- ${suggestion}\n`;
      });
      output += '\n';
    }
    
    return output;
  }
}