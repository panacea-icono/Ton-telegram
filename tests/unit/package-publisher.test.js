/**
 * Unit tests for Package Publisher
 */

const PackagePublisher = require('../../scripts/publish-packages.js');
const { execSync } = require('child_process');
const fs = require('fs');

// Mock modules
jest.mock('child_process');
jest.mock('fs');

describe('Package Publisher Tests', () => {
  let publisher;
  let mockPackageJson;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock package.json
    mockPackageJson = {
      name: 'panas-token-ecosystem',
      version: '1.0.0',
      description: 'Test package'
    };
    
    // Mock fs operations
    fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));
    fs.writeFileSync.mockImplementation(() => {});
    
    // Mock execSync
    execSync.mockReturnValue('success');
    
    publisher = new PackagePublisher();
  });

  describe('Initialization', () => {
    test('should initialize with correct package info', () => {
      expect(publisher.name).toBe('panas-token-ecosystem');
      expect(publisher.version).toBe('1.0.0');
      expect(publisher.registry).toBe('https://registry.npmjs.org');
    });

    test('should load package.json correctly', () => {
      expect(fs.readFileSync).toHaveBeenCalledWith('package.json', 'utf8');
    });
  });

  describe('Version Management', () => {
    test('should get next version correctly', () => {
      const nextVersion = publisher.getNextVersion();
      expect(nextVersion).toBe('1.0.1');
    });

    test('should update version in package.json', async () => {
      const newVersion = '1.0.1';
      
      await publisher.updateVersion(newVersion);
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'package.json',
        JSON.stringify({ ...mockPackageJson, version: newVersion }, null, 2) + '\n'
      );
    });

    test('should commit version changes', async () => {
      const newVersion = '1.0.1';
      
      await publisher.updateVersion(newVersion);
      
      expect(execSync).toHaveBeenCalledWith('git add package.json package-lock.json');
      expect(execSync).toHaveBeenCalledWith(`git commit -m "chore: bump version to ${newVersion}"`);
    });
  });

  describe('Git Operations', () => {
    test('should check git status', async () => {
      execSync.mockReturnValue(''); // Clean status
      
      await publisher.checkGitStatus();
      
      expect(execSync).toHaveBeenCalledWith('git status --porcelain');
      expect(execSync).toHaveBeenCalledWith('git branch --show-current');
    });

    test('should handle dirty git status', async () => {
      execSync.mockReturnValue('M package.json'); // Dirty status
      
      await expect(publisher.checkGitStatus()).rejects.toThrow('Please commit all changes before publishing');
    });

    test('should create git tag', async () => {
      const version = '1.0.1';
      const tagName = `v${version}`;
      
      // Mock tag doesn't exist
      execSync.mockImplementation((command) => {
        if (command.includes('git rev-parse')) {
          throw new Error('Tag not found');
        }
        return 'success';
      });
      
      const result = await publisher.createGitTag(version);
      
      expect(result).toBe(tagName);
      expect(execSync).toHaveBeenCalledWith(`git tag -a ${tagName} -m`, expect.any(Object));
    });

    test('should handle existing git tag', async () => {
      const version = '1.0.1';
      const tagName = `v${version}`;
      
      // Mock tag exists
      execSync.mockReturnValue('tag-hash');
      
      const result = await publisher.createGitTag(version);
      
      expect(result).toBe(tagName);
    });
  });

  describe('Package Building', () => {
    test('should build packages successfully', async () => {
      execSync.mockReturnValue('success');
      
      await publisher.buildPackages();
      
      expect(execSync).toHaveBeenCalledWith('rm -rf dist/ build/');
      expect(execSync).toHaveBeenCalledWith('npm ci');
      expect(execSync).toHaveBeenCalledWith('npm test');
      expect(execSync).toHaveBeenCalledWith('npm run lint');
      expect(execSync).toHaveBeenCalledWith('npm run build:prod');
      expect(execSync).toHaveBeenCalledWith('npm run build:docker');
    });

    test('should handle build errors gracefully', async () => {
      execSync.mockImplementation((command) => {
        if (command.includes('npm test')) {
          throw new Error('Tests failed');
        }
        return 'success';
      });
      
      await publisher.buildPackages();
      
      // Should continue despite test failures
      expect(execSync).toHaveBeenCalledWith('npm run lint');
    });
  });

  describe('NPM Publishing', () => {
    test('should publish to NPM successfully', async () => {
      // Mock version not published
      execSync.mockImplementation((command) => {
        if (command.includes('npm view')) {
          throw new Error('Version not found');
        }
        return 'success';
      });
      
      await publisher.publishToNPM();
      
      expect(execSync).toHaveBeenCalledWith('npm publish --access public');
    });

    test('should skip publishing if version already exists', async () => {
      // Mock version already published
      execSync.mockReturnValue('1.0.0');
      
      await publisher.publishToNPM();
      
      expect(execSync).not.toHaveBeenCalledWith('npm publish --access public');
    });
  });

  describe('Docker Operations', () => {
    test('should build and push Docker images', async () => {
      const tagName = 'v1.0.0';
      execSync.mockReturnValue('success');
      
      const result = await publisher.buildAndPushDockerImages(tagName);
      
      expect(execSync).toHaveBeenCalledWith(`docker build -t panas-token-ecosystem:${publisher.version} .`);
      expect(execSync).toHaveBeenCalledWith('docker build -t panas-token-ecosystem:latest .');
      expect(execSync).toHaveBeenCalledWith(`docker tag panas-token-ecosystem:${publisher.version} ghcr.io/panacea-icono/panas-token-ecosystem:${publisher.version}`);
      expect(execSync).toHaveBeenCalledWith('docker tag panas-token-ecosystem:latest ghcr.io/panacea-icono/panas-token-ecosystem:latest');
      
      expect(result).toEqual({
        version: `ghcr.io/panacea-icono/panas-token-ecosystem:${publisher.version}`,
        latest: 'ghcr.io/panacea-icono/panas-token-ecosystem:latest'
      });
    });
  });

  describe('Release Notes Generation', () => {
    test('should generate release notes', async () => {
      const tagName = 'v1.0.0';
      const dockerImages = {
        version: 'ghcr.io/panacea-icono/panas-token-ecosystem:1.0.0',
        latest: 'ghcr.io/panacea-icono/panas-token-ecosystem:latest'
      };
      
      execSync.mockReturnValue('commit-hash');
      
      const result = await publisher.generateReleaseNotes(tagName, dockerImages);
      
      expect(result).toContain('# 🚀 Release v1.0.0');
      expect(result).toContain('panas-token-ecosystem');
      expect(result).toContain('ghcr.io/panacea-icono/panas-token-ecosystem:1.0.0');
      expect(fs.writeFileSync).toHaveBeenCalledWith('RELEASE_NOTES.md', expect.any(String));
    });
  });

  describe('Error Handling', () => {
    test('should handle git operations errors', async () => {
      execSync.mockImplementation(() => {
        throw new Error('Git operation failed');
      });
      
      await expect(publisher.checkGitStatus()).rejects.toThrow('Git operation failed');
    });

    test('should handle build errors', async () => {
      execSync.mockImplementation((command) => {
        if (command.includes('npm run build:prod')) {
          throw new Error('Build failed');
        }
        return 'success';
      });
      
      await expect(publisher.buildPackages()).rejects.toThrow('Build failed');
    });

    test('should handle NPM publishing errors', async () => {
      execSync.mockImplementation((command) => {
        if (command.includes('npm publish')) {
          throw new Error('Publish failed');
        }
        throw new Error('Version not found');
      });
      
      await expect(publisher.publishToNPM()).rejects.toThrow('Publish failed');
    });
  });

  describe('Logging', () => {
    test('should log messages with timestamps', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      publisher.log('Test message', 'info');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] ℹ️ Test message/)
      );
      
      consoleSpy.mockRestore();
    });

    test('should use correct log types', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      publisher.log('Success message', 'success');
      publisher.log('Error message', 'error');
      publisher.log('Warning message', 'warning');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Success message'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('❌ Error message'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️ Warning message'));
      
      consoleSpy.mockRestore();
    });
  });
});
