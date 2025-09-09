#!/usr/bin/env node

/**
 * =============================================================================
 * INTEGRATION TEST - HEROKU, DOCKER, HUGGING FACE, FASTAPI
 * =============================================================================
 * Test script to verify integration of all required technologies
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

class IntegrationTest {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(description, testFn) {
    try {
      const result = testFn();
      if (result) {
        console.log(`✅ ${description}`);
        this.passed++;
      } else {
        console.log(`❌ ${description}`);
        this.failed++;
      }
    } catch (error) {
      console.log(`❌ ${description} - Error: ${error.message}`);
      this.failed++;
    }
  }

  run() {
    console.log('🧪 Running Integration Tests...');
    console.log('=' .repeat(50));

    // Test Heroku Integration
    this.test('Heroku: Procfile exists with FastAPI support', () => {
      const procfile = fs.readFileSync('Procfile', 'utf8');
      return procfile.includes('fastapi:') && procfile.includes('python main.py');
    });

    this.test('Heroku: app.json includes Python buildpack', () => {
      const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
      return appJson.buildpacks.some(bp => bp.url === 'heroku/python');
    });

    // Test Docker Integration
    this.test('Docker: docker-compose.yml includes FastAPI service', () => {
      const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
      return dockerCompose.includes('fastapi:') && dockerCompose.includes('8000:8000');
    });

    this.test('Docker: FastAPI Dockerfile exists', () => {
      return fs.existsSync('backend/fastapi/Dockerfile');
    });

    // Test FastAPI Integration
    this.test('FastAPI: main.py exists with proper structure', () => {
      const mainPy = fs.readFileSync('backend/fastapi/main.py', 'utf8');
      return mainPy.includes('from fastapi import FastAPI') && 
             mainPy.includes('/api/v1/huggingface/');
    });

    this.test('FastAPI: requirements.txt exists', () => {
      const requirements = fs.readFileSync('requirements.txt', 'utf8');
      return requirements.includes('fastapi') && requirements.includes('uvicorn');
    });

    // Test Hugging Face Integration
    this.test('Hugging Face: Node.js module exists', () => {
      return fs.existsSync('scripts/bots/modules/ai_huggingface.js');
    });

    this.test('Hugging Face: FastAPI endpoints configured', () => {
      const mainPy = fs.readFileSync('backend/fastapi/main.py', 'utf8');
      return mainPy.includes('/huggingface/generate') && 
             mainPy.includes('/huggingface/sentiment') &&
             mainPy.includes('/huggingface/summarize');
    });

    // Test Package.json Integration
    this.test('Package.json: Hugging Face dependency exists', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.dependencies['@huggingface/inference'];
    });

    this.test('Package.json: dev:fastapi script exists', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.scripts['dev:fastapi'] && 
             packageJson.scripts['dev:fastapi'].includes('backend/fastapi');
    });

    // Test Heroku Setup Scripts
    this.test('Heroku Setup: FastAPI methods exist', () => {
      const setupScript = fs.readFileSync('scripts/setup-heroku-apis.js', 'utf8');
      return setupScript.includes('generateFastAPIDockerService') &&
             setupScript.includes('generateFastAPIHerokuConfig');
    });

    console.log('=' .repeat(50));
    console.log(`📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed === 0) {
      console.log('🎉 All integration tests passed!');
      console.log('✅ Heroku, Docker, Hugging Face, and FastAPI are properly integrated');
      return true;
    } else {
      console.log('⚠️  Some tests failed. Please review the configuration.');
      return false;
    }
  }
}

// Run tests if script is called directly
if (require.main === module) {
  const integrationTest = new IntegrationTest();
  const success = integrationTest.run();
  process.exit(success ? 0 : 1);
}

module.exports = IntegrationTest;