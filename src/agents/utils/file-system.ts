import { existsSync, mkdirSync, writeFileSync, readFileSync, statSync, accessSync, constants } from 'fs';
import { join, dirname } from 'path';

export interface FileSystemOptions {
  overwrite?: boolean;
  createParentDirs?: boolean;
  encoding?: BufferEncoding;
}

export class FileSystem {
  /**
   * Check if a directory is empty (excluding allowed files)
   */
  static isDirectoryEmpty(dirPath: string, allowedFiles: string[] = []): boolean {
    try {
      const files = readFileSync(dirPath, 'utf8').split('\n').filter(Boolean);
      const nonAllowedFiles = files.filter(file => !allowedFiles.includes(file));
      return nonAllowedFiles.length === 0;
    } catch (error) {
      // Directory doesn't exist or can't be read
      return true;
    }
  }

  /**
   * Check if a directory exists and is writable
   */
  static isDirectoryWritable(dirPath: string): boolean {
    try {
      // Check if directory exists
      if (!existsSync(dirPath)) {
        // Try to create it
        mkdirSync(dirPath, { recursive: true });
      }
      
      // Try to create a test file
      const testFile = join(dirPath, `.fs-test-${Date.now()}`);
      writeFileSync(testFile, 'test');
      
      // Clean up
      require('fs').unlinkSync(testFile);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create directory recursively with proper permissions
   */
  static createDirectory(dirPath: string, options: { mode?: number } = {}): void {
    const mode = options.mode || 0o755;
    
    if (existsSync(dirPath)) {
      const stats = statSync(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${dirPath}`);
      }
      return;
    }
    
    // Create parent directories first
    const parent = dirname(dirPath);
    if (parent !== dirPath) {
      this.createDirectory(parent, options);
    }
    
    mkdirSync(dirPath, { mode });
  }

  /**
   * Write file with optional parent directory creation
   */
  static writeFile(
    filePath: string, 
    content: string, 
    options: FileSystemOptions = {}
  ): void {
    const {
      overwrite = false,
      createParentDirs = true,
      encoding = 'utf8'
    } = options;
    
    // Check if file exists
    if (existsSync(filePath) && !overwrite) {
      throw new Error(`File already exists: ${filePath}. Use overwrite: true to replace.`);
    }
    
    // Create parent directories if needed
    if (createParentDirs) {
      const parentDir = dirname(filePath);
      this.createDirectory(parentDir);
    }
    
    writeFileSync(filePath, content, { encoding });
  }

  /**
   * Read file with error handling
   */
  static readFile(filePath: string, encoding: BufferEncoding = 'utf8'): string {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const stats = statSync(filePath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${filePath}`);
    }
    
    return readFileSync(filePath, encoding);
  }

  /**
   * Check if a file exists and is readable
   */
  static isFileReadable(filePath: string): boolean {
    try {
      accessSync(filePath, constants.R_OK);
      return statSync(filePath).isFile();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file size in bytes
   */
  static getFileSize(filePath: string): number {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const stats = statSync(filePath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${filePath}`);
    }
    
    return stats.size;
  }

  /**
   * List files in directory with optional filter
   */
  static listFiles(
    dirPath: string, 
    options: { 
      recursive?: boolean; 
      filter?: (file: string) => boolean;
      excludeDirs?: boolean;
    } = {}
  ): string[] {
    const {
      recursive = false,
      filter = () => true,
      excludeDirs = true
    } = options;
    
    if (!existsSync(dirPath)) {
      throw new Error(`Directory not found: ${dirPath}`);
    }
    
    const stats = statSync(dirPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }
    
    const files: string[] = [];
    const entries = readFileSync(dirPath, 'utf8').split('\n').filter(Boolean);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      
      try {
        const entryStats = statSync(fullPath);
        
        if (entryStats.isDirectory()) {
          if (!excludeDirs) {
            files.push(fullPath);
          }
          
          if (recursive) {
            const subFiles = this.listFiles(fullPath, options);
            files.push(...subFiles);
          }
        } else if (entryStats.isFile()) {
          if (filter(fullPath)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip files we can't stat
        continue;
      }
    }
    
    return files;
  }

  /**
   * Copy file with optional transformations
   */
  static copyFile(
    sourcePath: string,
    targetPath: string,
    options: FileSystemOptions & {
      transform?: (content: string) => string;
    } = {}
  ): void {
    const {
      overwrite = false,
      createParentDirs = true,
      encoding = 'utf8',
      transform
    } = options;
    
    // Check source
    if (!existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    
    const sourceStats = statSync(sourcePath);
    if (!sourceStats.isFile()) {
      throw new Error(`Source is not a file: ${sourcePath}`);
    }
    
    // Check target
    if (existsSync(targetPath) && !overwrite) {
      throw new Error(`Target file already exists: ${targetPath}. Use overwrite: true to replace.`);
    }
    
    // Create parent directories if needed
    if (createParentDirs) {
      const parentDir = dirname(targetPath);
      this.createDirectory(parentDir);
    }
    
    // Read source
    const content = readFileSync(sourcePath, encoding);
    
    // Apply transformation if provided
    const finalContent = transform ? transform(content) : content;
    
    // Write target
    writeFileSync(targetPath, finalContent, { encoding });
  }

  /**
   * Ensure directory exists and is empty (or can be made empty)
   */
  static ensureEmptyDirectory(
    dirPath: string,
    options: {
      force?: boolean;
      allowedFiles?: string[];
    } = {}
  ): void {
    const { force = false, allowedFiles = [] } = options;
    
    // Create directory if it doesn't exist
    if (!existsSync(dirPath)) {
      this.createDirectory(dirPath);
      return;
    }
    
    // Check if it's a directory
    const stats = statSync(dirPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path exists but is not a directory: ${dirPath}`);
    }
    
    // Check if directory is empty (excluding allowed files)
    const files = this.listFiles(dirPath, { excludeDirs: false });
    const nonAllowedFiles = files.filter(file => {
      const fileName = file.split('/').pop() || file.split('\\').pop() || file;
      return !allowedFiles.includes(fileName);
    });
    
    if (nonAllowedFiles.length > 0) {
      if (force) {
        // In a real implementation, we would delete files
        // For safety, we'll just throw an error in this version
        throw new Error(`Directory is not empty and force flag not fully implemented: ${dirPath}`);
      } else {
        throw new Error(`Directory is not empty: ${dirPath}. Use force: true to clear it.`);
      }
    }
  }

  /**
   * Get disk space information (simplified version)
   */
  static getDiskSpace(dirPath: string): { total: number; free: number; used: number } {
    // This is a simplified version
    // In a real implementation, you would use system-specific calls
    try {
      // For now, return dummy values
      return {
        total: 1000000000, // 1GB
        free: 500000000,   // 500MB
        used: 500000000    // 500MB
      };
    } catch (error) {
      throw new Error(`Could not get disk space for ${dirPath}: ${error}`);
    }
  }

  /**
   * Validate that there's enough disk space for an operation
   */
  static validateDiskSpace(
    dirPath: string,
    requiredBytes: number,
    options: { bufferPercent?: number } = {}
  ): boolean {
    const { bufferPercent = 10 } = options;
    
    const space = this.getDiskSpace(dirPath);
    const requiredWithBuffer = requiredBytes * (1 + bufferPercent / 100);
    
    return space.free >= requiredWithBuffer;
  }
}