#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface TestCase {
  name: string;
  task: string;
  expectedFiles: string[];
  validationChecks: Array<{
    file: string;
    checks: string[];
  }>;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'User Registration Service',
    task: 'Create user registration service with email validation and password strength checking',
    expectedFiles: [
      'features/users/core/entities/user.entity.ts',
      'features/users/core/dto/create-user.dto.ts',
      'features/users/core/errors/user.errors.ts',
      'features/users/core/repositories/user.repository.ts',
      'features/users/core/services/user.service.ts',
      'features/users/core/index.ts',
      'features/users/index.ts',
    ],
    validationChecks: [
      {
        file: 'features/users/core/services/user.service.ts',
        checks: [
          'contains class UserService',
          'contains async registerUser',
          'returns Promise<Result<User, DomainError>>',
          'uses Result pattern',
          'has validation logic',
        ],
      },
      {
        file: 'features/users/core/errors/user.errors.ts',
        checks: [
          'extends DomainError',
          'has error codes',
          'has EmailAlreadyExistsError',
        ],
      },
    ],
  },
  {
    name: 'Product Catalog Feature',
    task: 'Implement product catalog feature with categories and inventory tracking',
    expectedFiles: [
      'features/products/core/entities/product.entity.ts',
      'features/products/core/entities/category.entity.ts',
      'features/products/core/dto/create-product.dto.ts',
      'features/products/core/errors/product.errors.ts',
      'features/products/core/repositories/product.repository.ts',
      'features/products/core/services/product.service.ts',
      'features/products/core/index.ts',
      'features/products/index.ts',
    ],
    validationChecks: [
      {
        file: 'features/products/core/services/product.service.ts',
        checks: [
          'contains class ProductService',
          'uses Result pattern',
          'has business logic methods',
        ],
      },
    ],
  },
];

class DevelopmentAgentTester {
  private testDir: string;
  
  constructor() {
    this.testDir = path.join(process.cwd(), 'test-dev-agent-' + Date.now());
  }
  
  async runTests(): Promise<void> {
    console.log('🧪 Testing Development Agent Capabilities\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const testCase of TEST_CASES) {
      console.log(`\n=== Test: ${testCase.name} ===`);
      console.log(`Task: ${testCase.task}`);
      
      // Create fresh test directory
      this.setupTestDirectory();
      
      // Simulate what Development Agent should do
      const success = await this.simulateDevelopmentAgent(testCase);
      
      if (success) {
        console.log('✅ PASS');
        passed++;
      } else {
        console.log('❌ FAIL');
        failed++;
      }
      
      // Clean up
      this.cleanupTestDirectory();
    }
    
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
      console.log('\n💡 Recommendations:');
      console.log('1. Development Agent needs to actually create files');
      console.log('2. Implement concrete file templates');
      console.log('3. Add validation logic for business rules');
      console.log('4. Ensure Result pattern is properly used');
    }
  }
  
  private setupTestDirectory(): void {
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true });
    }
    
    fs.mkdirSync(this.testDir, { recursive: true });
    
    // Create basic project structure
    const dirs = [
      'src',
      'src/core',
      'src/features',
      'src/infrastructure',
      'src/shared',
      'src/core/types',
    ];
    
    for (const dir of dirs) {
      fs.mkdirSync(path.join(this.testDir, dir), { recursive: true });
    }
    
    // Create core types
    const coreTypes = `
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
    
    fs.writeFileSync(
      path.join(this.testDir, 'src/core/types/result.ts'),
      coreTypes
    );
  }
  
  private async simulateDevelopmentAgent(testCase: TestCase): Promise<boolean> {
    try {
      console.log('Simulating Development Agent execution...');
      
      // Create feature directory
      const featureName = testCase.name.toLowerCase().includes('user') ? 'users' : 'products';
      const featureDir = path.join(this.testDir, 'src/features', featureName);
      
      // Create directory structure
      const featureDirs = [
        'core',
        'core/entities',
        'core/dto',
        'core/errors',
        'core/repositories',
        'core/services',
        'fragments',
        'api',
        'components',
        'tests',
      ];
      
      for (const dir of featureDirs) {
        fs.mkdirSync(path.join(featureDir, dir), { recursive: true });
      }
      
      // Based on test case, create appropriate files
      if (featureName === 'users') {
        this.createUserRegistrationFiles(featureDir);
      } else {
        this.createProductCatalogFiles(featureDir);
      }
      
      // Validate files were created
      const allFilesExist = testCase.expectedFiles.every(file => {
        const filePath = path.join(this.testDir, 'src', file);
        const exists = fs.existsSync(filePath);
        if (!exists) {
          console.log(`  Missing: ${file}`);
        }
        return exists;
      });
      
      if (!allFilesExist) {
        return false;
      }
      
      // Validate file contents
      for (const check of testCase.validationChecks) {
        const filePath = path.join(this.testDir, 'src', check.file);
        if (!fs.existsSync(filePath)) {
          console.log(`  File not found: ${check.file}`);
          return false;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        for (const checkStr of check.checks) {
          if (!this.checkContent(content, checkStr)) {
            console.log(`  Failed check in ${check.file}: ${checkStr}`);
            return false;
          }
        }
      }
      
      console.log(`  Created ${testCase.expectedFiles.length} files`);
      return true;
      
    } catch (error) {
      console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
  
  private createUserRegistrationFiles(featureDir: string): void {
    // User entity
    const userEntity = `
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
`;
    fs.writeFileSync(path.join(featureDir, 'core/entities/user.entity.ts'), userEntity);
    
    // CreateUser DTO
    const createUserDto = `
export interface CreateUserDto {
  email: string;
  password: string;
  confirmPassword: string;
}
`;
    fs.writeFileSync(path.join(featureDir, 'core/dto/create-user.dto.ts'), createUserDto);
    
    // User errors
    const userErrors = `
export enum UserErrorCode {
  EMAIL_ALREADY_EXISTS = 'USER_001',
  INVALID_EMAIL = 'USER_002',
  WEAK_PASSWORD = 'USER_003',
  PASSWORDS_DONT_MATCH = 'USER_004',
}

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(UserErrorCode.EMAIL_ALREADY_EXISTS, \`Email \${email} already exists\`);
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(UserErrorCode.INVALID_EMAIL, \`Invalid email format: \${email}\`);
  }
}

export class WeakPasswordError extends DomainError {
  constructor() {
    super(UserErrorCode.WEAK_PASSWORD, 'Password must be at least 8 characters with uppercase, lowercase, and numbers');
  }
}

export class PasswordsDontMatchError extends DomainError {
  constructor() {
    super(UserErrorCode.PASSWORDS_DONT_MATCH, 'Passwords do not match');
  }
}
`;
    fs.writeFileSync(path.join(featureDir, 'core/errors/user.errors.ts'), userErrors);
    
    // User repository interface
    const userRepository = `
import { User } from '../entities/user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
`;
    fs.writeFileSync(path.join(featureDir, 'core/repositories/user.repository.ts'), userRepository);
    
    // User service
    const userService = `
import { Result, success, failure } from '../../../../core/types/result';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { 
  EmailAlreadyExistsError, 
  InvalidEmailError, 
  WeakPasswordError, 
  PasswordsDontMatchError 
} from '../errors/user.errors';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\\d/.test(password);
    const hasMinimumLength = password.length >= 8;
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasMinimumLength;
  }

  async registerUser(dto: CreateUserDto): Promise<Result<User, DomainError>> {
    try {
      // Validate input
      if (!this.validateEmail(dto.email)) {
        return failure(new InvalidEmailError(dto.email));
      }

      if (dto.password !== dto.confirmPassword) {
        return failure(new PasswordsDontMatchError());
      }

      if (!this.validatePassword(dto.password)) {
        return failure(new WeakPasswordError());
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        return failure(new EmailAlreadyExistsError(dto.email));
      }

      // Create password hash (in real implementation, use bcrypt/argon2)
      const passwordHash = \`hashed_\${dto.password}\`;

      // Create user
      const user = await this.userRepository.create({
        email: dto.email,
        passwordHash,
      });

      return success(user);
    } catch (error) {
      return failure(error instanceof DomainError ? error : new DomainError('UNKNOWN_ERROR', 'An unexpected error occurred'));
    }
  }
}
`;
    fs.writeFileSync(path.join(featureDir, 'core/services/user.service.ts'), userService);
    
    // Core index
    const coreIndex = `
export * from './entities/user.entity';
export * from './dto/create-user.dto';
export * from './errors/user.errors';
export * from './repositories/user.repository';
export * from './services/user.service';
`;
    fs.writeFileSync(path.join(featureDir, 'core/index.ts'), coreIndex);
    
    // Feature module index
    const featureIndex = `
import { UserService } from './core/services/user.service';
import { UserRepository } from './core/repositories/user.repository';

export const userModule = {
  core: {
    services: [UserService],
    repositories: [UserRepository],
  },
  fragments: null,
  api: null,
  components: null,
};

export type UserModule = typeof userModule;
`;
    fs.writeFileSync(path.join(featureDir, 'index.ts'), featureIndex);
  }
  
  private createProductCatalogFiles(featureDir: string): void {
    // Similar implementation for product catalog
    // Simplified for brevity
    
    const productEntity = `
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}
`;
    fs.writeFileSync(path.join(featureDir, 'core/entities/product.entity.ts'), productEntity);
    
    // ... other product files would be created similarly
  }
  
  private checkContent(content: string, check: string): boolean {
    if (check === 'contains class UserService') {
      return content.includes('class UserService');
    }
    if (check === 'contains async registerUser') {
      return content.includes('async registerUser');
    }
    if (check === 'returns Promise<Result<User, DomainError>>') {
      return content.includes('Promise<Result<User, DomainError>>');
    }
    if (check === 'uses Result pattern') {
      return content.includes('Result<') || content.includes('success(') || content.includes('failure(');
    }
    if (check === 'has validation logic') {
      return content.includes('validateEmail') || content.includes('validatePassword');
    }
    if (check === 'extends DomainError') {
      return content.includes('extends DomainError');
    }
    if (check === 'has error codes') {
      return content.includes('ErrorCode') || content.includes('EMAIL_ALREADY_EXISTS');
    }
    if (check === 'has EmailAlreadyExistsError') {
      return content.includes('EmailAlreadyExistsError');
    }
    if (check === 'contains class ProductService') {
      return content.includes('class ProductService');
    }
    if (check === 'has business logic methods') {
      return content.includes('async ') && content.includes('Promise<Result<');
    }
    
    return content.includes(check);
  }
  
  private cleanupTestDirectory(): void {
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true });
    }
  }
}

// Run tests
const tester = new DevelopmentAgentTester();
tester.runTests().catch(console.error);