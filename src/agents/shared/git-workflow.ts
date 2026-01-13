import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export interface GitBranchInfo {
  currentBranch: string;
  isClean: boolean;
  hasChanges: boolean;
  remoteExists: boolean;
  ahead: number;
  behind: number;
}

export interface BranchSpec {
  type: 'feature' | 'bugfix' | 'spec' | 'hotfix' | 'release';
  name: string;
  description: string;
  issueId?: string;
  baseBranch?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class GitWorkflowManager {
  private projectRoot: string;
  
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }
  
  /**
   * Check if the project is a git repository
   */
  isGitRepository(): boolean {
    try {
      const gitDir = join(this.projectRoot, '.git');
      return existsSync(gitDir);
    } catch {
      return false;
    }
  }
  
  /**
   * Initialize git repository if not already initialized
   */
  initializeGit(): boolean {
    if (this.isGitRepository()) {
      return true;
    }
    
    try {
      execSync('git init', { cwd: this.projectRoot, stdio: 'pipe' });
      execSync('git add .', { cwd: this.projectRoot, stdio: 'pipe' });
      execSync('git commit -m "Initial commit: BlackMamba framework with agent system"', 
        { cwd: this.projectRoot, stdio: 'pipe' });
      return true;
    } catch (error) {
      console.error('Failed to initialize git repository:', error);
      return false;
    }
  }
  
  /**
   * Get current git branch information
   */
  getBranchInfo(): GitBranchInfo {
    try {
      const currentBranch = execSync('git branch --show-current', 
        { cwd: this.projectRoot, encoding: 'utf-8' }).trim();
      
      const statusOutput = execSync('git status --porcelain', 
        { cwd: this.projectRoot, encoding: 'utf-8' });
      const isClean = statusOutput.trim() === '';
      
      const hasChanges = !isClean;
      
      // Check remote
      let remoteExists = false;
      let ahead = 0;
      let behind = 0;
      
      try {
        execSync('git remote get-url origin', { cwd: this.projectRoot, stdio: 'pipe' });
        remoteExists = true;
        
        // Get ahead/behind info
        const branchInfo = execSync(`git rev-list --left-right --count origin/${currentBranch}...${currentBranch} || true`, 
          { cwd: this.projectRoot, encoding: 'utf-8' }).trim();
        
        if (branchInfo) {
          const [behindCount, aheadCount] = branchInfo.split('\t').map(Number);
          ahead = aheadCount;
          behind = behindCount;
        }
      } catch {
        // No remote or branch not pushed
      }
      
      return {
        currentBranch,
        isClean,
        hasChanges,
        remoteExists,
        ahead,
        behind,
      };
    } catch (error) {
      console.error('Failed to get git branch info:', error);
      return {
        currentBranch: 'unknown',
        isClean: false,
        hasChanges: false,
        remoteExists: false,
        ahead: 0,
        behind: 0,
      };
    }
  }
  
  /**
   * Generate branch name from spec
   */
  generateBranchName(spec: BranchSpec): string {
    const prefix = this.getBranchPrefix(spec.type);
    const cleanName = spec.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (spec.issueId) {
      return `${prefix}/${spec.issueId}-${cleanName}`;
    }
    
    return `${prefix}/${cleanName}`;
  }
  
  /**
   * Get branch prefix based on type
   */
  private getBranchPrefix(type: BranchSpec['type']): string {
    const prefixes = {
      feature: 'feature',
      bugfix: 'bugfix',
      spec: 'spec',
      hotfix: 'hotfix',
      release: 'release',
    };
    return prefixes[type];
  }
  
  /**
   * Validate branch name
   */
  validateBranchName(branchName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Check length
    if (branchName.length > 100) {
      errors.push('Branch name too long (max 100 characters)');
    }
    
    // Check format
    const branchPattern = /^(feature|bugfix|spec|hotfix|release)\/[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)?$/;
    if (!branchPattern.test(branchName)) {
      errors.push(`Invalid branch name format. Expected: {type}/{name} or {type}/{issue-id}-{name}`);
      suggestions.push('Use format: feature/user-authentication or feature/123-add-user-auth');
    }
    
    // Check for special characters
    const specialCharPattern = /[^a-z0-9\/-]/;
    if (specialCharPattern.test(branchName)) {
      errors.push('Branch name contains invalid characters');
      suggestions.push('Use only lowercase letters, numbers, hyphens, and forward slashes');
    }
    
    // Check if branch already exists
    try {
      const existingBranches = execSync('git branch --list', 
        { cwd: this.projectRoot, encoding: 'utf-8' });
      let remoteBranches = '';
      try {
        remoteBranches = execSync('git branch -r --list', 
          { cwd: this.projectRoot, encoding: 'utf-8' });
      } catch {
        // Ignore if no remote branches
      }
      
      const allBranches = existingBranches + remoteBranches;
      if (allBranches.includes(branchName)) {
        warnings.push(`Branch "${branchName}" already exists`);
      }
    } catch {
      // Ignore error for branch check
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }
  
  /**
   * Create a new branch for development
   */
  createBranch(spec: BranchSpec): { success: boolean; branchName: string; message: string } {
    // Ensure git is initialized
    if (!this.isGitRepository()) {
      const initialized = this.initializeGit();
      if (!initialized) {
        return {
          success: false,
          branchName: '',
          message: 'Failed to initialize git repository',
        };
      }
    }
    
    // Generate and validate branch name
    const branchName = this.generateBranchName(spec);
    const validation = this.validateBranchName(branchName);
    
    if (!validation.valid) {
      return {
        success: false,
        branchName,
        message: `Invalid branch name: ${validation.errors.join(', ')}`,
      };
    }
    
    // Check current branch state
    const branchInfo = this.getBranchInfo();
    
    if (!branchInfo.isClean) {
      return {
        success: false,
        branchName,
        message: 'Current branch has uncommitted changes. Please commit or stash changes before creating a new branch.',
      };
    }
    
    // Create new branch
    try {
      const baseBranch = spec.baseBranch || 'main';
      
      // Try to checkout base branch first
      try {
        execSync(`git checkout ${baseBranch}`, { cwd: this.projectRoot, stdio: 'pipe' });
      } catch {
        // If main doesn't exist, try master
        try {
          execSync('git checkout master', { cwd: this.projectRoot, stdio: 'pipe' });
        } catch {
          // Stay on current branch if neither exists
        }
      }
      
      // Pull latest changes
      try {
        execSync('git pull', { cwd: this.projectRoot, stdio: 'pipe' });
      } catch {
        // Ignore pull errors if no remote
      }
      
      // Create and checkout new branch
      execSync(`git checkout -b ${branchName}`, { cwd: this.projectRoot, stdio: 'pipe' });
      
      // Create initial commit with branch description
      const commitMessage = this.generateInitialCommitMessage(spec);
      execSync('git add .', { cwd: this.projectRoot, stdio: 'pipe' });
      execSync(`git commit -m "${commitMessage}"`, { cwd: this.projectRoot, stdio: 'pipe' });
      
      return {
        success: true,
        branchName,
        message: `Created branch "${branchName}" for ${spec.type}: ${spec.description}`,
      };
      
    } catch (error) {
      return {
        success: false,
        branchName,
        message: `Failed to create branch: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  
  /**
   * Generate initial commit message
   */
  private generateInitialCommitMessage(spec: BranchSpec): string {
    const typeMap = {
      feature: 'feat',
      bugfix: 'fix',
      spec: 'docs',
      hotfix: 'hotfix',
      release: 'release',
    };
    
    const type = typeMap[spec.type];
    const scope = spec.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    let message = `${type}(${scope}): ${spec.description}`;
    
    if (spec.issueId) {
      message += `\n\nRefs: ${spec.issueId}`;
    }
    
    return message;
  }
  
  /**
   * Validate changes before merge
   */
  validateForMerge(branchName?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    const currentBranch = branchName || this.getBranchInfo().currentBranch;
    
    // Check if branch is clean
    const statusOutput = execSync('git status --porcelain', 
      { cwd: this.projectRoot, encoding: 'utf-8' }).trim();
    
    if (statusOutput) {
      errors.push('Branch has uncommitted changes');
      suggestions.push('Commit or stash changes before merging');
    }
    
    // Check if tests pass (simulated - would run actual tests)
    warnings.push('Manual test verification required before merge');
    suggestions.push('Run: npm test && npm run lint && npm run typecheck');
    
    // Check if branch is up to date with main
    try {
      execSync('git fetch origin', { cwd: this.projectRoot, stdio: 'pipe' });
      
      const mergeBase = execSync(`git merge-base origin/main ${currentBranch}`, 
        { cwd: this.projectRoot, encoding: 'utf-8' }).trim();
      
      const mainHead = execSync('git rev-parse origin/main', 
        { cwd: this.projectRoot, encoding: 'utf-8' }).trim();
      
      if (mergeBase !== mainHead) {
        warnings.push('Branch is not up to date with main');
        suggestions.push('Merge main into branch before merging: git merge origin/main');
      }
    } catch {
      // Ignore if no remote
    }
    
    // Check commit message format
    try {
      const commits = execSync(`git log origin/main..${currentBranch} --oneline`, 
        { cwd: this.projectRoot, encoding: 'utf-8' });
      
      const commitLines = commits.trim().split('\n');
      const invalidCommits = commitLines.filter(line => {
        // Simple commit message validation
        return !line.match(/^(feat|fix|docs|style|refactor|test|chore|hotfix|release)\([^)]+\):/);
      });
      
      if (invalidCommits.length > 0) {
        warnings.push('Some commits do not follow conventional commit format');
        suggestions.push('Use format: type(scope): description');
      }
    } catch {
      // Ignore commit check errors
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }
  
  /**
   * Merge branch back to main
   */
  mergeToMain(branchName: string, strategy: 'merge' | 'squash' | 'rebase' = 'merge'): 
    { success: boolean; message: string } {
    
    // Validate before merge
    const validation = this.validateForMerge(branchName);
    if (!validation.valid) {
      return {
        success: false,
        message: `Cannot merge: ${validation.errors.join(', ')}`,
      };
    }
    
    try {
      // Switch to main branch
      execSync('git checkout main', { cwd: this.projectRoot, stdio: 'pipe' });
      execSync('git pull', { cwd: this.projectRoot, stdio: 'pipe' });
      
      // Merge based on strategy
      switch (strategy) {
        case 'squash':
          execSync(`git merge --squash ${branchName}`, { cwd: this.projectRoot, stdio: 'pipe' });
          execSync('git commit -m "Squashed merge"', { cwd: this.projectRoot, stdio: 'pipe' });
          break;
        case 'rebase':
          execSync(`git rebase ${branchName}`, { cwd: this.projectRoot, stdio: 'pipe' });
          break;
        default:
          execSync(`git merge --no-ff ${branchName}`, { cwd: this.projectRoot, stdio: 'pipe' });
          break;
      }
      
      // Push to remote
      execSync('git push origin main', { cwd: this.projectRoot, stdio: 'pipe' });
      
      // Delete local branch
      execSync(`git branch -d ${branchName}`, { cwd: this.projectRoot, stdio: 'pipe' });
      
      return {
        success: true,
        message: `Successfully merged ${branchName} into main using ${strategy} strategy`,
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Merge failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  
  /**
   * Get git workflow status
   */
  getWorkflowStatus(): {
    initialized: boolean;
    currentBranch: string;
    branchInfo: GitBranchInfo;
    recommendations: string[];
  } {
    const initialized = this.isGitRepository();
    const branchInfo = this.getBranchInfo();
    const recommendations: string[] = [];
    
    if (!initialized) {
      recommendations.push('Initialize git repository: git init');
    } else if (!branchInfo.remoteExists) {
      recommendations.push('Add remote repository: git remote add origin <url>');
    } else if (branchInfo.behind > 0) {
      recommendations.push(`Branch is ${branchInfo.behind} commit(s) behind main. Run: git pull origin main`);
    }
    
    if (branchInfo.hasChanges) {
      recommendations.push('Commit or stash changes before creating new branch');
    }
    
    return {
      initialized,
      currentBranch: branchInfo.currentBranch,
      branchInfo,
      recommendations,
    };
  }
}