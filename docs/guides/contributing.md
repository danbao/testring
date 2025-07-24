# Contributing to Testring

Thank you for your interest in contributing to testring! This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 16.0 or higher
- npm 7.0 or higher
- Git
- A GitHub account

### Setting Up the Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/testring.git
   cd testring
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ringcentral/testring.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Build the project**:
   ```bash
   npm run build
   ```
6. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

## Development Workflow

### Creating a Feature Branch

1. **Sync with upstream**:
   ```bash
   git checkout main
   git pull upstream main
   ```
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Making Changes

1. **Make your changes** in the appropriate files
2. **Add tests** for new functionality
3. **Update documentation** if needed
4. **Run tests locally**:
   ```bash
   npm test
   npm run lint
   ```

### Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```
2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Create a Pull Request** on GitHub

## Code Style and Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add proper type annotations
- Document complex functions with JSDoc comments

### Testing Requirements

- Write unit tests for all new functions
- Update integration tests when changing core functionality
- Ensure all tests pass before submitting
- Aim for high test coverage

### Commit Message Format

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add new endpoint for test execution
fix(driver): resolve browser connection timeout
docs(readme): update installation instructions
```

## Project Structure

```
testring/
├── core/                 # Core framework modules
│   ├── api/             # Test execution API
│   ├── cli/             # Command line interface
│   ├── types/           # TypeScript type definitions
│   └── ...
├── packages/            # Extension packages
│   ├── browser-proxy/   # Browser proxy functionality
│   ├── plugin-*/        # Framework plugins
│   └── ...
├── docs/                # Documentation
└── scripts/             # Build and utility scripts
```

## Development Tools

### Available Scripts

```bash
# Development
npm run build         # Build all packages
npm run build:watch   # Build with file watching
npm run clean         # Clean build artifacts

# Testing
npm test             # Run all tests
npm run test:unit    # Run unit tests only
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Run tests with coverage

# Linting and formatting
npm run lint         # Lint all code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier

# Package management
npm run version      # Version packages
npm run publish      # Publish to npm
```

### IDE Setup

**VS Code Extensions:**
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- GitLens

**Recommended Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Package Development

### Creating a New Package

1. **Use the package template**:
   ```bash
   npm run create-package my-new-package
   ```

2. **Package structure**:
   ```
   packages/my-package/
   ├── src/             # Source code
   ├── test/            # Tests
   ├── package.json     # Package configuration
   ├── tsconfig.json    # TypeScript configuration
   └── README.md        # Package documentation
   ```

3. **Update dependencies**:
   - Add to `lerna.json` if needed
   - Update root `package.json` if it's a core dependency

### Plugin Development

For detailed plugin development guidelines, see [Plugin Development Guide](plugin-development.md).

### Publishing Packages

**Development Publishing:**
- Use dev package names (`@testring-dev/*`)
- Automatic versioning with username and commit ID
- Available for testing and validation

**Production Publishing:**
- Only from `ringcentral/testring` main branch
- Manual version control
- Official package registry

## Testing Guidelines

### Unit Testing

- Use Jest as the testing framework
- Place tests in `test/` directories
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error scenarios

**Example:**
```typescript
describe('TestRunner', () => {
  it('should execute tests successfully', async () => {
    const runner = new TestRunner();
    const result = await runner.run(['test1.js']);
    
    expect(result.success).toBe(true);
    expect(result.testCount).toBe(1);
  });
});
```

### Integration Testing

- Test complete workflows
- Use real browser automation
- Test cross-browser compatibility
- Validate plugin interactions

### End-to-End Testing

- Use the `e2e-test-app` package
- Test real-world scenarios
- Validate performance characteristics
- Test CI/CD integration

## Documentation

### Writing Documentation

- Use clear, concise language
- Include code examples
- Add links to related topics
- Update README files when adding features

### Documentation Structure

- **API Reference**: Detailed function/class documentation
- **Guides**: Step-by-step tutorials
- **Examples**: Real-world usage examples
- **Troubleshooting**: Common issues and solutions

## Pull Request Process

### Before Submitting

1. **Test thoroughly**:
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

2. **Update documentation**:
   - Update README files
   - Add/update JSDoc comments
   - Update CHANGELOG if applicable

3. **Review your changes**:
   - Check diff for unintended changes
   - Ensure no debug code remains
   - Verify commit messages follow conventions

### PR Requirements

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Breaking changes are documented
- [ ] Performance impact is considered

### Review Process

1. **Automated checks** run on PR creation
2. **Maintainer review** for code quality and architecture
3. **Testing** on multiple platforms if needed
4. **Approval and merge** by maintainers

## Getting Help

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Don't hesitate to ask for feedback

## Release Process

### Version Management

- Follow [Semantic Versioning](https://semver.org/)
- Update CHANGELOG.md
- Tag releases properly
- Update documentation versions

### Release Types

- **Patch** (x.x.X): Bug fixes, small improvements
- **Minor** (x.X.x): New features, backward compatible
- **Major** (X.x.x): Breaking changes

Thank you for contributing to testring! Your efforts help make web testing better for everyone. 