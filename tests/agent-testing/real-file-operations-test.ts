#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface TestResult {
  name: string;
  success: boolean;
  filesCreated: number;
  errors: string[];
  duration: number;
}

class RealFileOperationsTest {
  private testDir: string;
  
  constructor() {
    this.testDir = path.join(process.cwd(), 'test-real-files-' + Date.now());
  }
  
  async runTests(): Promise<TestResult[]> {
    console.log('🧪 Testing Real File Operations\n');
    
    const results: TestResult[] = [];
    
    // Test 1: Create basic project structure
    results.push(await this.testCreateProjectStructure());
    
    // Test 2: Create feature module with files
    results.push(await this.testCreateFeatureModule());
    
    // Test 3: Create business logic files
    results.push(await this.testCreateBusinessLogic());
    
    // Test 4: Create test files
    results.push(await this.testCreateTestFiles());
    
    // Clean up
    this.cleanup();
    
    return results;
  }
  
  private async testCreateProjectStructure(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let filesCreated = 0;
    
    try {
      console.log('=== Test 1: Create Basic Project Structure ===');
      
      // Create directory structure
      const dirs = [
        'src/core/domains',
        'src/core/services',
        'src/core/repositories',
        'src/core/errors',
        'src/features',
        'src/infrastructure/database',
        'src/infrastructure/auth',
        'src/infrastructure/http',
        'src/shared',
        'tests/unit',
        'tests/fragment',
        'tests/e2e',
      ];
      
      for (const dir of dirs) {
        const dirPath = path.join(this.testDir, dir);
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  Created directory: ${dir}`);
      }
      
      // Create core types file
      const coreTypesPath = path.join(this.testDir, 'src/core/types/result.ts');
      const coreTypesContent = `
export type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E };

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export function success<T>(value: T): Result<T, never> {
  return { success: true, value };
}

export function failure<E extends Error>(error: E): Result<never, E> {
  return { success: false, error };
}
`;
      
      fs.mkdirSync(path.join(this.testDir, 'src/core/types'), { recursive: true });
      fs.writeFileSync(coreTypesPath, coreTypesContent);
      filesCreated++;
      console.log(`  Created file: src/core/types/result.ts`);
      
      // Create package.json
      const packageJsonPath = path.join(this.testDir, 'package.json');
      const packageJsonContent = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          test: 'jest',
          dev: 'ts-node src/server.ts',
          build: 'tsc',
        },
        dependencies: {
          typescript: '^5.0.0',
        },
        devDependencies: {
          jest: '^29.0.0',
          '@types/jest': '^29.5.0',
          'ts-jest': '^29.1.0',
        },
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
      filesCreated++;
      console.log(`  Created file: package.json`);
      
      // Create tsconfig.json
      const tsconfigPath = path.join(this.testDir, 'tsconfig.json');
      const tsconfigContent = {
        compilerOptions: {
          target: 'ES2022',
          module: 'commonjs',
          lib: ['ES2022'],
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          declaration: true,
          declarationMap: true,
          sourceMap: true,
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist', 'tests'],
      };
      
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigContent, null, 2));
      filesCreated++;
      console.log(`  Created file: tsconfig.json`);
      
      // Verify files were created
      const requiredFiles = [
        'src/core/types/result.ts',
        'package.json',
        'tsconfig.json',
      ];
      
      for (const file of requiredFiles) {
        const filePath = path.join(this.testDir, file);
        if (!fs.existsSync(filePath)) {
          errors.push(`Missing required file: ${file}`);
        }
      }
      
      return {
        name: 'Create Basic Project Structure',
        success: errors.length === 0,
        filesCreated,
        errors,
        duration: Date.now() - startTime,
      };
      
    } catch (error) {
      errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        name: 'Create Basic Project Structure',
        success: false,
        filesCreated,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }
  
  private async testCreateFeatureModule(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let filesCreated = 0;
    
    try {
      console.log('\n=== Test 2: Create Feature Module ===');
      
      const featureName = 'users';
      const featureDir = path.join(this.testDir, 'src/features', featureName);
      
      // Create feature directory structure
      const featureDirs = [
        'core/entities',
        'core/dto',
        'core/errors',
        'core/repositories',
        'core/services',
        'fragments',
        'api',
        'components',
        'tests/unit',
        'tests/fragment',
        'tests/e2e',
      ];
      
      for (const dir of featureDirs) {
        const dirPath = path.join(featureDir, dir);
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  Created directory: src/features/${featureName}/${dir}`);
      }
      
      // Create user entity
      const userEntityPath = path.join(featureDir, 'core/entities/user.entity.ts');
      const userEntityContent = `
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
`;
      fs.writeFileSync(userEntityPath, userEntityContent);
      filesCreated++;
      console.log(`  Created file: src/features/${featureName}/core/entities/user.entity.ts`);
      
      // Create user service
      const userServicePath = path.join(featureDir, 'core/services/user.service.ts');
      const userServiceContent = `
import { Result, success, failure } from '../../../../core/types/result';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { DomainError } from '../../../../core/types/result';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: string): Promise<Result<User, DomainError>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return failure(new DomainError('USER_NOT_FOUND', \`User with id \${id} not found\`));
      }
      return success(user);
    } catch (error) {
      return failure(new DomainError('DATABASE_ERROR', 'Failed to fetch user'));
    }
  }

  async createUser(email: string, password: string): Promise<Result<User, DomainError>> {
    try {
      // Validate input
      if (!email || !password) {
        return failure(new DomainError('INVALID_INPUT', 'Email and password are required'));
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return failure(new DomainError('USER_EXISTS', \`User with email \${email} already exists\`));
      }

      // Create password hash (in real implementation, use bcrypt/argon2)
      const passwordHash = \`hashed_\${password}\`;

      // Create user
      const user = await this.userRepository.create({
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return success(user);
    } catch (error) {
      return failure(new DomainError('DATABASE_ERROR', 'Failed to create user'));
    }
  }
}
`;
      fs.writeFileSync(userServicePath, userServiceContent);
      filesCreated++;
      console.log(`  Created file: src/features/${featureName}/core/services/user.service.ts`);
      
      // Create repository interface
      const repositoryPath = path.join(featureDir, 'core/repositories/user.repository.ts');
      const repositoryContent = `
import { User } from '../entities/user.entity';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
`;
      fs.writeFileSync(repositoryPath, repositoryContent);
      filesCreated++;
      console.log(`  Created file: src/features/${featureName}/core/repositories/user.repository.ts`);
      
      // Create feature index
      const indexPath = path.join(featureDir, 'index.ts');
      const indexContent = `
export * from './core/entities/user.entity';
export * from './core/services/user.service';
export * from './core/repositories/user.repository';
`;
      fs.writeFileSync(indexPath, indexContent);
      filesCreated++;
      console.log(`  Created file: src/features/${featureName}/index.ts`);
      
      // Verify files were created
      const requiredFiles = [
        'core/entities/user.entity.ts',
        'core/services/user.service.ts',
        'core/repositories/user.repository.ts',
        'index.ts',
      ];
      
      for (const file of requiredFiles) {
        const filePath = path.join(featureDir, file);
        if (!fs.existsSync(filePath)) {
          errors.push(`Missing required file: src/features/${featureName}/${file}`);
        }
      }
      
      return {
        name: 'Create Feature Module',
        success: errors.length === 0,
        filesCreated,
        errors,
        duration: Date.now() - startTime,
      };
      
    } catch (error) {
      errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        name: 'Create Feature Module',
        success: false,
        filesCreated,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }
  
  private async testCreateBusinessLogic(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let filesCreated = 0;
    
    try {
      console.log('\n=== Test 3: Create Business Logic ===');
      
      // Create a core service
      const coreServicePath = path.join(this.testDir, 'src/core/services/auth.service.ts');
      const coreServiceContent = `
import { Result, success, failure } from '../types/result';
import { DomainError } from '../types/result';

export interface AuthToken {
  token: string;
  expiresAt: Date;
  userId: string;
}

export class AuthService {
  private tokens: Map<string, AuthToken> = new Map();
  
  async generateToken(userId: string): Promise<Result<AuthToken, DomainError>> {
    try {
      const token = \`token_\${Date.now()}_\${Math.random().toString(36).substr(2)}\`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      const authToken: AuthToken = {
        token,
        expiresAt,
        userId,
      };
      
      this.tokens.set(token, authToken);
      
      return success(authToken);
    } catch (error) {
      return failure(new DomainError('TOKEN_GENERATION_FAILED', 'Failed to generate authentication token'));
    }
  }
  
  async validateToken(token: string): Promise<Result<{ userId: string }, DomainError>> {
    try {
      const authToken = this.tokens.get(token);
      
      if (!authToken) {
        return failure(new DomainError('INVALID_TOKEN', 'Invalid authentication token'));
      }
      
      if (authToken.expiresAt < new Date()) {
        this.tokens.delete(token);
        return failure(new DomainError('EXPIRED_TOKEN', 'Authentication token has expired'));
      }
      
      return success({ userId: authToken.userId });
    } catch (error) {
      return failure(new DomainError('TOKEN_VALIDATION_FAILED', 'Failed to validate token'));
    }
  }
  
  async revokeToken(token: string): Promise<Result<void, DomainError>> {
    try {
      this.tokens.delete(token);
      return success(undefined);
    } catch (error) {
      return failure(new DomainError('TOKEN_REVOCATION_FAILED', 'Failed to revoke token'));
    }
  }
}
`;
      fs.mkdirSync(path.join(this.testDir, 'src/core/services'), { recursive: true });
      fs.writeFileSync(coreServicePath, coreServiceContent);
      filesCreated++;
      console.log(`  Created file: src/core/services/auth.service.ts`);
      
      // Create domain error
      const domainErrorPath = path.join(this.testDir, 'src/core/errors/auth.errors.ts');
      const domainErrorContent = `
import { DomainError } from '../types/result';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Invalid email or password');
  }
}

export class AccountLockedError extends DomainError {
  constructor() {
    super('ACCOUNT_LOCKED', 'Account is locked due to too many failed attempts');
  }
}

export class TokenExpiredError extends DomainError {
  constructor() {
    super('TOKEN_EXPIRED', 'Authentication token has expired');
  }
}
`;
      fs.mkdirSync(path.join(this.testDir, 'src/core/errors'), { recursive: true });
      fs.writeFileSync(domainErrorPath, domainErrorContent);
      filesCreated++;
      console.log(`  Created file: src/core/errors/auth.errors.ts`);
      
      // Verify files were created
      const requiredFiles = [
        'src/core/services/auth.service.ts',
        'src/core/errors/auth.errors.ts',
      ];
      
      for (const file of requiredFiles) {
        const filePath = path.join(this.testDir, file);
        if (!fs.existsSync(filePath)) {
          errors.push(`Missing required file: ${file}`);
        }
      }
      
      return {
        name: 'Create Business Logic',
        success: errors.length === 0,
        filesCreated,
        errors,
        duration: Date.now() - startTime,
      };
      
    } catch (error) {
      errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        name: 'Create Business Logic',
        success: false,
        filesCreated,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }
  
  private async testCreateTestFiles(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let filesCreated = 0;
    
    try {
      console.log('\n=== Test 4: Create Test Files ===');
      
      // Create unit test for user service
      const userServiceTestPath = path.join(this.testDir, 'tests/unit/user-service.test.ts');
      const userServiceTestContent = `
import { UserService } from '../../src/features/users/core/services/user.service';
import { UserRepository } from '../../src/features/users/core/repositories/user.repository';
import { DomainError } from '../../src/core/types/result';

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    userService = new UserService(mockRepository);
  });
  
  test('getUserById returns user when found', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockRepository.findById.mockResolvedValue(mockUser);
    
    const result = await userService.getUserById('123');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(mockUser);
    }
  });
  
  test('getUserById returns error when user not found', async () => {
    mockRepository.findById.mockResolvedValue(null);
    
    const result = await userService.getUserById('123');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('USER_NOT_FOUND');
    }
  });
  
  test('createUser returns error for existing email', async () => {
    const existingUser = {
      id: '123',
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockRepository.findByEmail.mockResolvedValue(existingUser);
    
    const result = await userService.createUser('test@example.com', 'password123');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('USER_EXISTS');
    }
  });
  
  test('createUser returns error for invalid input', async () => {
    const result = await userService.createUser('', '');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_INPUT');
    }
  });
});
`;
      fs.mkdirSync(path.join(this.testDir, 'tests/unit'), { recursive: true });
      fs.writeFileSync(userServiceTestPath, userServiceTestContent);
      filesCreated++;
      console.log(`  Created file: tests/unit/user-service.test.ts`);
      
      // Create jest config
      const jestConfigPath = path.join(this.testDir, 'jest.config.js');
      const jestConfigContent = `
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
`;
      fs.writeFileSync(jestConfigPath, jestConfigContent);
      filesCreated++;
      console.log(`  Created file: jest.config.js`);
      
      // Verify files were created
      const requiredFiles = [
        'tests/unit/user-service.test.ts',
        'jest.config.js',
      ];
      
      for (const file of requiredFiles) {
        const filePath = path.join(this.testDir, file);
        if (!fs.existsSync(filePath)) {
          errors.push(`Missing required file: ${file}`);
        }
      }
      
      return {
        name: 'Create Test Files',
        success: errors.length === 0,
        filesCreated,
        errors,
        duration: Date.now() - startTime,
      };
      
    } catch (error) {
      errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        name: 'Create Test Files',
        success: false,
        filesCreated,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }
  
  private cleanup(): void {
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true });
      console.log(`\n🧹 Cleaned up test directory: ${this.testDir}`);
    }
  }
  
  printResults(results: TestResult[]): void {
    console.log('\n📊 Test Results:');
    console.log('='.repeat(60));
    
    let totalFiles = 0;
    let totalSuccess = 0;
    
    for (const result of results) {
      totalFiles += result.filesCreated;
      if (result.success) totalSuccess++;
      
      console.log(`\n${result.success ? '✅' : '❌'} ${result.name}`);
      console.log(`  Duration: ${result.duration}ms`);
      console.log(`  Files Created: ${result.filesCreated}`);
      
      if (result.errors.length > 0) {
        console.log(`  Errors:`);
        for (const error of result.errors) {
          console.log(`    - ${error}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${totalSuccess}/${results.length} (${Math.round((totalSuccess / results.length) * 100)}%)`);
    console.log(`Total Files Created: ${totalFiles}`);
    console.log('='.repeat(60));
  }
}

// Run the tests
const tester = new RealFileOperationsTest();
tester.runTests().then(results => {
  tester.printResults(results);
  
  const allPassed = results.every(r => r.success);
  process.exit(allPassed ? 0 : 1);
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});