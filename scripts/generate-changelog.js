#!/usr/bin/env node

/**
 * Script para generar CHANGELOG automáticamente
 * Basado en commits de Git y tags de release
 */

const { execSync } = require('child_process');
const fs = require('fs');

class ChangelogGenerator {
  constructor() {
    this.packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.changelogPath = 'CHANGELOG.md';
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

  executeCommand(command) {
    try {
      return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
      this.log(`Command failed: ${command}`, 'error');
      throw error;
    }
  }

  getGitTags() {
    try {
      const tags = this.executeCommand('git tag --sort=-version:refname');
      return tags.split('\n').filter(tag => tag && tag.startsWith('v'));
    } catch (error) {
      this.log('No Git tags found', 'warning');
      return [];
    }
  }

  getCommitsBetweenTags(fromTag, toTag = 'HEAD') {
    try {
      const range = fromTag ? `${fromTag}..${toTag}` : toTag;
      const commits = this.executeCommand(`git log ${range} --pretty=format:"%h|%s|%an|%ad" --date=short`);
      
      return commits.split('\n')
        .filter(commit => commit.trim())
        .map(commit => {
          const [hash, message, author, date] = commit.split('|');
          return { hash, message, author, date };
        });
    } catch (error) {
      this.log(`Error getting commits between ${fromTag} and ${toTag}`, 'error');
      return [];
    }
  }

  categorizeCommits(commits) {
    const categories = {
      feat: { title: '🚀 Features', commits: [] },
      fix: { title: '🐛 Bug Fixes', commits: [] },
      docs: { title: '📚 Documentation', commits: [] },
      style: { title: '💄 Styles', commits: [] },
      refactor: { title: '♻️ Refactoring', commits: [] },
      perf: { title: '⚡ Performance', commits: [] },
      test: { title: '🧪 Tests', commits: [] },
      chore: { title: '🔧 Chores', commits: [] },
      ci: { title: '👷 CI/CD', commits: [] },
      build: { title: '📦 Build', commits: [] },
      revert: { title: '⏪ Reverts', commits: [] },
      other: { title: '📝 Other', commits: [] }
    };

    commits.forEach(commit => {
      const message = commit.message.toLowerCase();
      let categorized = false;

      // Check for conventional commit format
      for (const [type, category] of Object.entries(categories)) {
        if (message.startsWith(`${type}:`) || message.startsWith(`${type}(`)) {
          category.commits.push(commit);
          categorized = true;
          break;
        }
      }

      // Check for keywords
      if (!categorized) {
        if (message.includes('feat') || message.includes('feature') || message.includes('add')) {
          categories.feat.commits.push(commit);
        } else if (message.includes('fix') || message.includes('bug') || message.includes('error')) {
          categories.fix.commits.push(commit);
        } else if (message.includes('doc') || message.includes('readme') || message.includes('guide')) {
          categories.docs.commits.push(commit);
        } else if (message.includes('style') || message.includes('format') || message.includes('prettier')) {
          categories.style.commits.push(commit);
        } else if (message.includes('refactor') || message.includes('restructure')) {
          categories.refactor.commits.push(commit);
        } else if (message.includes('perf') || message.includes('performance') || message.includes('optimize')) {
          categories.perf.commits.push(commit);
        } else if (message.includes('test') || message.includes('spec')) {
          categories.test.commits.push(commit);
        } else if (message.includes('ci') || message.includes('workflow') || message.includes('action')) {
          categories.ci.commits.push(commit);
        } else if (message.includes('build') || message.includes('compile') || message.includes('bundle')) {
          categories.build.commits.push(commit);
        } else {
          categories.other.commits.push(commit);
        }
      }
    });

    return categories;
  }

  formatCommit(commit) {
    const message = commit.message.replace(/^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert):\s*/i, '');
    return `- ${message} (${commit.hash})`;
  }

  generateChangelog() {
    this.log('Generating CHANGELOG...');
    
    const tags = this.getGitTags();
    let changelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

`;

    // Process each tag
    for (let i = 0; i < tags.length; i++) {
      const currentTag = tags[i];
      const nextTag = tags[i + 1];
      
      this.log(`Processing tag: ${currentTag}`);
      
      const commits = this.getCommitsBetweenTags(nextTag, currentTag);
      const categories = this.categorizeCommits(commits);
      
      // Add version header
      const version = currentTag.replace('v', '');
      const date = this.executeCommand(`git log -1 --format=%ai ${currentTag}`).split(' ')[0];
      
      changelog += `## [${version}] - ${date}\n\n`;
      
      // Add categorized commits
      let hasContent = false;
      for (const [type, category] of Object.entries(categories)) {
        if (category.commits.length > 0) {
          changelog += `### ${category.title}\n\n`;
          category.commits.forEach(commit => {
            changelog += `${this.formatCommit(commit)}\n`;
          });
          changelog += '\n';
          hasContent = true;
        }
      }
      
      if (!hasContent) {
        changelog += 'No significant changes.\n\n';
      }
    }

    // Add footer
    changelog += `---

## Legend

- 🚀 **Features**: New functionality
- 🐛 **Bug Fixes**: Bug fixes and corrections
- 📚 **Documentation**: Documentation updates
- 💄 **Styles**: Code style changes
- ♻️ **Refactoring**: Code refactoring
- ⚡ **Performance**: Performance improvements
- 🧪 **Tests**: Test additions and updates
- 🔧 **Chores**: Maintenance tasks
- 👷 **CI/CD**: Continuous integration and deployment
- 📦 **Build**: Build system changes
- ⏪ **Reverts**: Reverted changes
- 📝 **Other**: Other changes

---

Generated on ${new Date().toISOString()}
`;

    return changelog;
  }

  async generate() {
    try {
      this.log('Starting CHANGELOG generation...');
      
      const changelog = this.generateChangelog();
      
      // Write to file
      fs.writeFileSync(this.changelogPath, changelog);
      
      this.log(`CHANGELOG generated: ${this.changelogPath}`, 'success');
      
      // Show summary
      const lines = changelog.split('\n');
      const versionCount = (changelog.match(/## \[/g) || []).length;
      const commitCount = (changelog.match(/- /g) || []).length;
      
      this.log(`Summary: ${versionCount} versions, ${commitCount} changes`);
      
      return changelog;
      
    } catch (error) {
      this.log(`CHANGELOG generation failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const generator = new ChangelogGenerator();
  
  generator.generate()
    .then(() => {
      console.log('\n🎉 CHANGELOG generated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ CHANGELOG generation failed:', error.message);
      process.exit(1);
    });
}

module.exports = ChangelogGenerator;
