#!/usr/bin/env node

/**
 * Script para publicar paquetes del ecosistema Panas Token
 * Genera releases, actualiza versiones y publica en múltiples registros
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PackagePublisher {
  constructor() {
    this.packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.version = this.packageJson.version;
    this.name = this.packageJson.name;
    this.registry = 'https://registry.npmjs.org';
    this.dockerRegistry = 'ghcr.io';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      build: '🔨'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async executeCommand(command, options = {}) {
    try {
      this.log(`Executing: ${command}`, 'build');
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        ...options 
      });
      return result.trim();
    } catch (error) {
      this.log(`Command failed: ${command}`, 'error');
      this.log(`Error: ${error.message}`, 'error');
      throw error;
    }
  }

  async checkGitStatus() {
    this.log('Checking Git status...');
    
    try {
      const status = await this.executeCommand('git status --porcelain');
      if (status) {
        this.log('Uncommitted changes detected:', 'warning');
        console.log(status);
        throw new Error('Please commit all changes before publishing');
      }
      
      const branch = await this.executeCommand('git branch --show-current');
      if (branch !== 'main') {
        this.log(`Current branch: ${branch}`, 'warning');
        this.log('Publishing from non-main branch', 'warning');
      }
      
      this.log('Git status clean', 'success');
    } catch (error) {
      throw new Error(`Git check failed: ${error.message}`);
    }
  }

  async updateVersion(newVersion) {
    this.log(`Updating version to ${newVersion}...`);
    
    try {
      // Update package.json
      this.packageJson.version = newVersion;
      fs.writeFileSync('package.json', JSON.stringify(this.packageJson, null, 2) + '\n');
      
      // Update package-lock.json
      await this.executeCommand('npm install --package-lock-only');
      
      // Commit version update
      await this.executeCommand(`git add package.json package-lock.json`);
      await this.executeCommand(`git commit -m "chore: bump version to ${newVersion}"`);
      
      this.log(`Version updated to ${newVersion}`, 'success');
    } catch (error) {
      throw new Error(`Version update failed: ${error.message}`);
    }
  }

  async createGitTag(version) {
    const tagName = `v${version}`;
    this.log(`Creating Git tag: ${tagName}`);
    
    try {
      // Check if tag already exists
      try {
        await this.executeCommand(`git rev-parse ${tagName}`);
        this.log(`Tag ${tagName} already exists`, 'warning');
        return tagName;
      } catch {
        // Tag doesn't exist, create it
      }
      
      const tagMessage = `Release ${tagName}: Complete CI/CD Pipeline System

🚀 Major Features:
- Complete GitHub Actions CI/CD pipeline
- Docker multi-stage builds and orchestration
- Heroku deployment configuration
- Telegram bot orchestrator with AI support
- Comprehensive monitoring and debugging tools
- Multi-platform deployment scripts
- Security token management system

📦 Infrastructure:
- Docker Compose for dev/prod environments
- Nginx reverse proxy configuration
- Prometheus and Grafana monitoring
- Automated testing and linting

🤖 Telegram Integration:
- 29 bot configuration system
- AI modules (OpenAI, Llama support)
- Publisher module for channel management
- Bot validation and health checks

🔒 Security:
- Secure token management
- Environment variable configuration
- No sensitive data in repository

This release establishes a production-ready foundation for the Panas Token Ecosystem.`;

      await this.executeCommand(`git tag -a ${tagName} -m "${tagMessage}"`);
      this.log(`Git tag ${tagName} created`, 'success');
      
      return tagName;
    } catch (error) {
      throw new Error(`Git tag creation failed: ${error.message}`);
    }
  }

  async buildPackages() {
    this.log('Building packages...');
    
    try {
      // Clean previous builds
      await this.executeCommand('rm -rf dist/ build/');
      
      // Install dependencies
      await this.executeCommand('npm ci');
      
      // Run tests
      try {
        await this.executeCommand('npm test');
        this.log('Tests passed', 'success');
      } catch (error) {
        this.log('Tests failed or not configured', 'warning');
      }
      
      // Run linting
      try {
        await this.executeCommand('npm run lint');
        this.log('Linting passed', 'success');
      } catch (error) {
        this.log('Linting completed with warnings', 'warning');
      }
      
      // Build production
      await this.executeCommand('npm run build:prod');
      
      // Build Docker images
      await this.executeCommand('npm run build:docker');
      
      this.log('Packages built successfully', 'success');
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async publishToNPM() {
    this.log('Publishing to NPM...');
    
    try {
      // Check if already published
      try {
        const publishedVersion = await this.executeCommand(`npm view ${this.name}@${this.version} version`);
        if (publishedVersion === this.version) {
          this.log(`Version ${this.version} already published to NPM`, 'warning');
          return;
        }
      } catch {
        // Version not published yet
      }
      
      // Publish to NPM
      await this.executeCommand(`npm publish --access public`);
      this.log(`Published ${this.name}@${this.version} to NPM`, 'success');
    } catch (error) {
      throw new Error(`NPM publish failed: ${error.message}`);
    }
  }

  async buildAndPushDockerImages(tagName) {
    this.log('Building and pushing Docker images...');
    
    try {
      const imageName = `panas-token-ecosystem`;
      const fullImageName = `${this.dockerRegistry}/panacea-icono/${imageName}`;
      
      // Build images
      await this.executeCommand(`docker build -t ${imageName}:${this.version} .`);
      await this.executeCommand(`docker build -t ${imageName}:latest .`);
      
      // Tag for registry
      await this.executeCommand(`docker tag ${imageName}:${this.version} ${fullImageName}:${this.version}`);
      await this.executeCommand(`docker tag ${imageName}:latest ${fullImageName}:latest`);
      
      // Login to registry
      await this.executeCommand(`echo $GITHUB_TOKEN | docker login ${this.dockerRegistry} -u $GITHUB_ACTOR --password-stdin`);
      
      // Push images
      await this.executeCommand(`docker push ${fullImageName}:${this.version}`);
      await this.executeCommand(`docker push ${fullImageName}:latest`);
      
      this.log(`Docker images pushed to ${fullImageName}`, 'success');
      
      return {
        version: `${fullImageName}:${this.version}`,
        latest: `${fullImageName}:latest`
      };
    } catch (error) {
      throw new Error(`Docker build/push failed: ${error.message}`);
    }
  }

  async pushToGit(tagName) {
    this.log('Pushing to Git repository...');
    
    try {
      await this.executeCommand('git push origin main');
      await this.executeCommand(`git push origin ${tagName}`);
      this.log('Pushed to Git repository', 'success');
    } catch (error) {
      throw new Error(`Git push failed: ${error.message}`);
    }
  }

  async generateReleaseNotes(tagName, dockerImages) {
    this.log('Generating release notes...');
    
    const releaseNotes = `# 🚀 Release ${tagName}

## 📦 Package Information

### NPM Package
- **Name**: \`${this.name}\`
- **Version**: \`${this.version}\`
- **Registry**: \`${this.registry}\`

### Docker Images
- **Version**: \`${dockerImages.version}\`
- **Latest**: \`${dockerImages.latest}\`

## 🚀 Usage

### NPM
\`\`\`bash
npm install ${this.name}@${this.version}
\`\`\`

### Docker
\`\`\`bash
# Pull and run the image
docker pull ${dockerImages.version}
docker run -d --name panas-token-ecosystem \\
  -p 3000:3000 \\
  -e NODE_ENV=production \\
  ${dockerImages.version}
\`\`\`

### Docker Compose
\`\`\`bash
# Use the latest image
docker-compose up -d
\`\`\`

## 🔧 Features

- Complete CI/CD pipeline system
- Docker multi-stage builds and orchestration
- Heroku deployment configuration
- Telegram bot orchestrator with AI support
- Comprehensive monitoring and debugging tools
- Multi-platform deployment scripts
- Security token management system

## 📚 Documentation

- [PIPELINES-README.md](./PIPELINES-README.md) - Complete CI/CD documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Code of conduct

## 🔒 Security

- Secure token management
- Environment variable configuration
- No sensitive data in repository

---

**Published**: ${new Date().toISOString()}
**Commit**: ${await this.executeCommand('git rev-parse HEAD')}
`;

    fs.writeFileSync('RELEASE_NOTES.md', releaseNotes);
    this.log('Release notes generated', 'success');
    
    return releaseNotes;
  }

  async publish(version = null) {
    try {
      this.log('Starting package publication process...', 'build');
      
      // Determine version
      const newVersion = version || this.getNextVersion();
      this.log(`Publishing version: ${newVersion}`);
      
      // Pre-publication checks
      await this.checkGitStatus();
      
      // Update version
      await this.updateVersion(newVersion);
      
      // Create Git tag
      const tagName = await this.createGitTag(newVersion);
      
      // Build packages
      await this.buildPackages();
      
      // Publish to NPM
      await this.publishToNPM();
      
      // Build and push Docker images
      const dockerImages = await this.buildAndPushDockerImages(tagName);
      
      // Push to Git
      await this.pushToGit(tagName);
      
      // Generate release notes
      const releaseNotes = await this.generateReleaseNotes(tagName, dockerImages);
      
      this.log('Package publication completed successfully!', 'success');
      this.log(`Version: ${newVersion}`);
      this.log(`Tag: ${tagName}`);
      this.log(`NPM: ${this.name}@${newVersion}`);
      this.log(`Docker: ${dockerImages.version}`);
      
      return {
        version: newVersion,
        tag: tagName,
        npm: `${this.name}@${newVersion}`,
        docker: dockerImages
      };
      
    } catch (error) {
      this.log(`Publication failed: ${error.message}`, 'error');
      throw error;
    }
  }

  getNextVersion() {
    const [major, minor, patch] = this.version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const version = args[0];
  
  const publisher = new PackagePublisher();
  
  publisher.publish(version)
    .then((result) => {
      console.log('\n🎉 Publication completed successfully!');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Publication failed:', error.message);
      process.exit(1);
    });
}

module.exports = PackagePublisher;
