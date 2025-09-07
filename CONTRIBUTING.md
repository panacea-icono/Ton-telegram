# 🤝 Contributing to Panas Token Ecosystem

Thank you for your interest in contributing to the Panas Token Ecosystem! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 8+
- Git
- Docker (optional)
- Heroku CLI (for deployment)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/your-username/Ton-telegram.git
   cd Ton-telegram
   ```

3. Add the upstream repository:

   ```bash
   git remote add upstream https://github.com/panacea-icono/Ton-telegram.git
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env.local

# Edit with your configurations
nano .env.local
```

### 3. Database Setup

```bash
# Run migrations
npm run migrate

# Start services
npm run docker:up
```

### 4. Start Development

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
npm run dev:bot
```

## 🔄 Contributing Process

### 1. Create a Branch

```bash
# Create a new branch from main
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific tests
npm run test:unit
npm run test:integration

# Run linting
npm run lint

# Run security audit
npm audit
```

### 4. Commit Changes

```bash
# Add your changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## 📝 Coding Standards

### JavaScript/TypeScript

- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions
- Handle errors properly

### Code Style

```javascript
// Good
const user = await getUserById(userId);
if (!user) {
  throw new Error('User not found');
}

// Bad
const u = await getUserById(id);
if (!u) throw new Error('User not found');
```

### File Organization

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Data models
├── middleware/      # Express middleware
├── utils/           # Utility functions
├── config/          # Configuration files
└── tests/           # Test files
```

## 🧪 Testing

### Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific test file
npm test -- --testPathPattern=user.test.js
```

### Test Requirements

- Unit tests for all new functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Document complex algorithms
- Include examples in documentation
- Keep README files updated

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error codes
- Keep OpenAPI spec updated

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version number incremented
- [ ] Security review completed
- [ ] Performance impact assessed
- [ ] Backward compatibility maintained

### Creating a Release

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release branch
4. Run full test suite
5. Create pull request
6. Merge after review
7. Create GitHub release

## 🐛 Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Relevant logs
- Screenshots (if applicable)

## ✨ Feature Requests

When requesting features, please include:

- Clear description of the feature
- Problem it solves
- Proposed solution
- Use cases
- Acceptance criteria
- Mockups (if applicable)

## 🔒 Security

### Reporting Security Issues

**Do not create public issues for security vulnerabilities.**

Instead, email us at: **<security@iconosa.com>**

### Security Guidelines

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all inputs
- Use HTTPS in production
- Keep dependencies updated
- Follow OWASP guidelines

## 📞 Getting Help

- **Documentation**: Check the [Wiki](https://github.com/panacea-icono/Ton-telegram/wiki)
- **Issues**: Search existing [issues](https://github.com/panacea-icono/Ton-telegram/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/panacea-icono/Ton-telegram/discussions)
- **Email**: <repositorios.panacea@gmail.com>

## 🏆 Recognition

Contributors will be:

- Listed in the project contributors
- Given credit in release notes
- Considered for maintainer roles
- Invited to project discussions

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing to Panas Token Ecosystem!** 🚀

**Panacea | Icono SA** - Building the future of blockchain technology
