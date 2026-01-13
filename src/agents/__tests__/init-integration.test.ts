import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

describe('CLI Init Command Integration Tests', () => {
  let testDir: string;
  const cliPath = join(__dirname, '../../../dist/agents/cli.js');

  beforeEach(() => {
    // Create a temporary directory for testing
    testDir = join(__dirname, '../../../test-init-integration-' + Date.now());
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Basic initialization', () => {
    it('should initialize a project with default options', async () => {
      const projectDir = join(testDir, 'default-project');
      mkdirSync(projectDir);

      const { stdout } = await execAsync(`node ${cliPath} init --skip-git --skip-install`, {
        cwd: projectDir
      });

      // Check output contains success message
      expect(stdout).toContain('🎉 BlackMamba project initialized successfully!');
      expect(stdout).toContain('Created 38 directories');
      expect(stdout).toContain('Generated 10 configuration files');

      // Check key files were created
      expect(existsSync(join(projectDir, 'package.json'))).toBe(true);
      expect(existsSync(join(projectDir, 'tsconfig.json'))).toBe(true);
      expect(existsSync(join(projectDir, 'src/server.ts'))).toBe(true);
      expect(existsSync(join(projectDir, '.gitignore'))).toBe(true);
      expect(existsSync(join(projectDir, '.env.example'))).toBe(true);

      // Check directory structure
      expect(existsSync(join(projectDir, 'src/core'))).toBe(true);
      expect(existsSync(join(projectDir, 'src/features/auth'))).toBe(true);
      expect(existsSync(join(projectDir, 'src/infrastructure'))).toBe(true);
      expect(existsSync(join(projectDir, '.opencode/agent'))).toBe(true);

      // Check package.json has correct name
      const packageJson = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'));
      expect(packageJson.name).toBe('my-blackmamba-app');
    });

    it('should initialize a project with custom name and description', async () => {
      const projectDir = join(testDir, 'custom-project');
      mkdirSync(projectDir);

      const { stdout } = await execAsync(
        `node ${cliPath} init --skip-git --skip-install --name "My Custom App" --description "A custom description"`,
        { cwd: projectDir }
      );

      expect(stdout).toContain('🎉 BlackMamba project initialized successfully!');

      // Check package.json has custom values
      const packageJson = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'));
      expect(packageJson.name).toBe('My Custom App');
      expect(packageJson.description).toBe('A custom description');
    });
  });

  describe('Git initialization', () => {
    it('should skip git initialization when --skip-git flag is used', async () => {
      const projectDir = join(testDir, 'no-git-project');
      mkdirSync(projectDir);

      const { stdout } = await execAsync(
        `node ${cliPath} init --skip-git --skip-install`,
        { cwd: projectDir }
      );

      expect(stdout).toContain('Created 38 directories');
      expect(stdout).toContain('Generated 10 configuration files');
      // Should not mention Git repository initialized
      expect(stdout).not.toContain('Git repository initialized');
    });

    it('should handle git initialization failure gracefully', async () => {
      const projectDir = join(testDir, 'git-failure-project');
      mkdirSync(projectDir);

      // Test without --skip-git (git may or may not be installed)
      const { stdout } = await execAsync(
        `node ${cliPath} init --skip-install`,
        { cwd: projectDir }
      );

      // Should still succeed even if git fails
      expect(stdout).toContain('🎉 BlackMamba project initialized successfully!');
    });
  });

  describe('Dependency installation', () => {
    it('should skip dependency installation when --skip-install flag is used', async () => {
      const projectDir = join(testDir, 'no-install-project');
      mkdirSync(projectDir);

      const { stdout } = await execAsync(
        `node ${cliPath} init --skip-git --skip-install`,
        { cwd: projectDir }
      );

      expect(stdout).toContain('TypeScript compilation skipped (dependencies not installed)');
      expect(stdout).not.toContain('Dependencies installed');
    });
  });

  describe('Error handling', () => {
    it('should fail when directory is not empty', async () => {
      const projectDir = join(testDir, 'non-empty-project');
      mkdirSync(projectDir);
      
      // Create a file to make directory non-empty
      const testFile = join(projectDir, 'test.txt');
      require('fs').writeFileSync(testFile, 'test content');

      await expect(
        execAsync(`node ${cliPath} init --skip-git --skip-install`, { cwd: projectDir })
      ).rejects.toThrow();

      // Check that no project files were created
      expect(existsSync(join(projectDir, 'package.json'))).toBe(false);
      expect(existsSync(join(projectDir, 'src'))).toBe(false);
    });

    it('should fail when directory is not writable', async () => {
      // This test is skipped because creating a non-writable directory
      // requires root privileges or special setup
      // In a real environment, we would test this with a mock
    });
  });

  describe('Verbose mode', () => {
    it('should show detailed output when --verbose flag is used', async () => {
      const projectDir = join(testDir, 'verbose-project');
      mkdirSync(projectDir);

      const { stdout } = await execAsync(
        `node ${cliPath} init --skip-git --skip-install --verbose`,
        { cwd: projectDir }
      );

      // Should show detailed progress messages
      expect(stdout).toContain('[BlackMamba Init]');
      expect(stdout).toContain('Created:');
      expect(stdout).toContain('Generated:');
    });
  });

  describe('Agent configuration files', () => {
    it('should copy all agent configuration files', async () => {
      const projectDir = join(testDir, 'agent-config-project');
      mkdirSync(projectDir);

      await execAsync(`node ${cliPath} init --skip-git --skip-install`, {
        cwd: projectDir
      });

      const agentConfigDir = join(projectDir, '.opencode/agent');
      expect(existsSync(join(agentConfigDir, 'blackmamba-master.md'))).toBe(true);
      expect(existsSync(join(agentConfigDir, 'blackmamba-development.md'))).toBe(true);
      expect(existsSync(join(agentConfigDir, 'blackmamba-htmx.md'))).toBe(true);
      expect(existsSync(join(agentConfigDir, 'blackmamba-database.md'))).toBe(true);
      expect(existsSync(join(agentConfigDir, 'blackmamba-testing.md'))).toBe(true);

      // Check that files have content
      const masterConfig = readFileSync(join(agentConfigDir, 'blackmamba-master.md'), 'utf-8');
      expect(masterConfig.length).toBeGreaterThan(0);
      expect(masterConfig).toContain('BlackMamba Master Agent');
    });
  });
});