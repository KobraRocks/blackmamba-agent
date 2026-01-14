import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { createHash } from 'crypto';

export interface UpdateOptions {
  backup?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  force?: boolean;
}

export interface UpdateResult {
  success: boolean;
  message: string;
  updatedFiles: string[];
  backedUpFiles: string[];
  skippedFiles: string[];
  errors: string[];
  warnings: string[];
}

export interface FileComparison {
  sourcePath: string;
  targetPath: string;
  sourceHash: string;
  targetHash: string;
  different: boolean;
  action: 'update' | 'skip' | 'backup' | 'error';
  reason?: string;
}

export class AgentUpdater {
  private sourceAgentDir: string;
  private targetAgentDir: string;
  private options: UpdateOptions;
  
  constructor(
    targetProjectRoot: string = process.cwd(),
    sourceFrameworkRoot?: string,
    options: UpdateOptions = {}
  ) {
    // Default source is the BlackMamba framework's .opencode/agent directory
    this.sourceAgentDir = sourceFrameworkRoot 
      ? join(sourceFrameworkRoot, '.opencode/agent')
      : join(__dirname, '../../../.opencode/agent');
    
    this.targetAgentDir = join(targetProjectRoot, '.opencode/agent');
    this.options = {
      backup: true,
      dryRun: false,
      verbose: false,
      force: false,
      ...options,
    };
  }
  
  async update(): Promise<UpdateResult> {
    const result: UpdateResult = {
      success: false,
      message: '',
      updatedFiles: [],
      backedUpFiles: [],
      skippedFiles: [],
      errors: [],
      warnings: [],
    };
    
    try {
      this.log('Starting agent files update...');
      
      // 1. Validate source directory exists
      if (!existsSync(this.sourceAgentDir)) {
        result.errors.push(`Source agent directory not found: ${this.sourceAgentDir}`);
        result.message = 'Update failed: Source agent files not found';
        return result;
      }
      
      // 2. Validate target directory exists or create it
      if (!existsSync(this.targetAgentDir)) {
        if (this.options.force) {
          this.log(`Creating target directory: ${this.targetAgentDir}`);
          mkdirSync(this.targetAgentDir, { recursive: true });
          result.warnings.push(`Created missing agent directory: ${this.targetAgentDir}`);
        } else {
          result.errors.push(`Target agent directory not found: ${this.targetAgentDir}`);
          result.message = 'Update failed: Target agent directory not found. Use --force to create it.';
          return result;
        }
      }
      
      // 3. Get list of agent files from source
      const sourceFiles = this.getAgentFiles(this.sourceAgentDir);
      if (sourceFiles.length === 0) {
        result.errors.push('No agent files found in source directory');
        result.message = 'Update failed: No source agent files found';
        return result;
      }
      
      this.log(`Found ${sourceFiles.length} agent files in source`);
      
      // 4. Compare and update files
      const comparisons: FileComparison[] = [];
      
      for (const sourceFile of sourceFiles) {
        const fileName = basename(sourceFile);
        const targetFile = join(this.targetAgentDir, fileName);
        
        const comparison = await this.compareFiles(sourceFile, targetFile);
        comparisons.push(comparison);
        
        this.log(`  ${fileName}: ${comparison.action} (${comparison.reason})`);
      }
      
      // 5. Execute updates based on comparisons
      if (!this.options.dryRun) {
        for (const comparison of comparisons) {
          await this.executeUpdate(comparison, result);
        }
      } else {
        this.log('DRY RUN: No files will be modified');
        for (const comparison of comparisons) {
          if (comparison.action === 'update') {
            result.updatedFiles.push(basename(comparison.targetPath));
          } else if (comparison.action === 'backup') {
            result.backedUpFiles.push(basename(comparison.targetPath));
          } else if (comparison.action === 'skip') {
            result.skippedFiles.push(basename(comparison.targetPath));
          }
        }
      }
      
      // 6. Generate summary
      const updatedCount = result.updatedFiles.length;
      const backedUpCount = result.backedUpFiles.length;
      const skippedCount = result.skippedFiles.length;
      
      if (updatedCount > 0 || this.options.dryRun) {
        result.success = true;
        result.message = this.generateSuccessMessage(updatedCount, backedUpCount, skippedCount);
      } else if (skippedCount === sourceFiles.length) {
        result.success = true;
        result.message = 'All agent files are already up to date. No updates needed.';
      } else {
        result.success = false;
        result.message = 'Update completed with no changes';
      }
      
      this.log('Update completed');
      
    } catch (error) {
      result.success = false;
      result.message = `Update failed: ${error instanceof Error ? error.message : String(error)}`;
      result.errors.push(result.message);
    }
    
    return result;
  }
  
  private getAgentFiles(directory: string): string[] {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(directory);
      return files
        .filter((file: string) => file.endsWith('.md') && file.startsWith('blackmamba-'))
        .map((file: string) => join(directory, file));
    } catch (error) {
      this.log(`Error reading directory ${directory}: ${error}`);
      return [];
    }
  }
  
  private async compareFiles(sourcePath: string, targetPath: string): Promise<FileComparison> {
    const sourceExists = existsSync(sourcePath);
    const targetExists = existsSync(targetPath);
    
    if (!sourceExists) {
      return {
        sourcePath,
        targetPath,
        sourceHash: '',
        targetHash: '',
        different: true,
        action: 'error',
        reason: 'Source file not found',
      };
    }
    
    // Read file contents
    const sourceContent = readFileSync(sourcePath, 'utf-8');
    const sourceHash = this.hashContent(sourceContent);
    
    if (!targetExists) {
      return {
        sourcePath,
        targetPath,
        sourceHash,
        targetHash: '',
        different: true,
        action: 'update',
        reason: 'Target file does not exist',
      };
    }
    
    const targetContent = readFileSync(targetPath, 'utf-8');
    const targetHash = this.hashContent(targetContent);
    
    const different = sourceHash !== targetHash;
    
    if (!different) {
      return {
        sourcePath,
        targetPath,
        sourceHash,
        targetHash,
        different: false,
        action: 'skip',
        reason: 'Files are identical',
      };
    }
    
    if (this.options.backup) {
      return {
        sourcePath,
        targetPath,
        sourceHash,
        targetHash,
        different: true,
        action: 'backup',
        reason: 'Files differ, backup required',
      };
    }
    
    return {
      sourcePath,
      targetPath,
      sourceHash,
      targetHash,
      different: true,
      action: 'update',
      reason: 'Files differ',
    };
  }
  
  private async executeUpdate(comparison: FileComparison, result: UpdateResult): Promise<void> {
    const fileName = basename(comparison.targetPath);
    
    try {
      switch (comparison.action) {
        case 'update':
          // Copy source to target
          const sourceContent = readFileSync(comparison.sourcePath, 'utf-8');
          writeFileSync(comparison.targetPath, sourceContent);
          result.updatedFiles.push(fileName);
          break;
          
        case 'backup':
          // Create backup then update
          const backupPath = `${comparison.targetPath}.backup-${Date.now()}`;
          const targetContent = readFileSync(comparison.targetPath, 'utf-8');
          writeFileSync(backupPath, targetContent);
          
          const sourceContent2 = readFileSync(comparison.sourcePath, 'utf-8');
          writeFileSync(comparison.targetPath, sourceContent2);
          
          result.backedUpFiles.push(fileName);
          result.updatedFiles.push(fileName);
          break;
          
        case 'skip':
          result.skippedFiles.push(fileName);
          break;
          
        case 'error':
          result.errors.push(`Error processing ${fileName}: ${comparison.reason}`);
          break;
      }
    } catch (error) {
      result.errors.push(`Failed to process ${fileName}: ${error}`);
    }
  }
  
  private hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }
  
  private generateSuccessMessage(
    updatedCount: number,
    backedUpCount: number,
    skippedCount: number
  ): string {
    const messages: string[] = [];
    
    if (this.options.dryRun) {
      messages.push('📋 DRY RUN SUMMARY:');
    } else {
      messages.push('✅ Agent files update completed:');
    }
    
    if (updatedCount > 0) {
      messages.push(`   Updated: ${updatedCount} file${updatedCount !== 1 ? 's' : ''}`);
    }
    
    if (backedUpCount > 0) {
      messages.push(`   Backed up: ${backedUpCount} file${backedUpCount !== 1 ? 's' : ''}`);
    }
    
    if (skippedCount > 0) {
      messages.push(`   Skipped (already up to date): ${skippedCount} file${skippedCount !== 1 ? 's' : ''}`);
    }
    
    if (this.options.dryRun) {
      messages.push('');
      messages.push('💡 This was a dry run. No files were actually modified.');
      messages.push('   Use --no-dry-run to execute the updates.');
    } else if (backedUpCount > 0) {
      messages.push('');
      messages.push('💾 Backups were created with .backup-<timestamp> extension.');
    }
    
    return messages.join('\n');
  }
  
  private log(message: string): void {
    if (this.options.verbose) {
      console.log(`[Agent Updater] ${message}`);
    }
  }
  
  // Utility method to check if update is needed
  async checkForUpdates(): Promise<{
    needsUpdate: boolean;
    outdatedFiles: string[];
    totalFiles: number;
  }> {
    const sourceFiles = this.getAgentFiles(this.sourceAgentDir);
    const outdatedFiles: string[] = [];
    
    for (const sourceFile of sourceFiles) {
      const fileName = basename(sourceFile);
      const targetFile = join(this.targetAgentDir, fileName);
      
      if (!existsSync(targetFile)) {
        outdatedFiles.push(fileName);
        continue;
      }
      
      const sourceContent = readFileSync(sourceFile, 'utf-8');
      const targetContent = readFileSync(targetFile, 'utf-8');
      
      const sourceHash = this.hashContent(sourceContent);
      const targetHash = this.hashContent(targetContent);
      
      if (sourceHash !== targetHash) {
        outdatedFiles.push(fileName);
      }
    }
    
    return {
      needsUpdate: outdatedFiles.length > 0,
      outdatedFiles,
      totalFiles: sourceFiles.length,
    };
  }
}