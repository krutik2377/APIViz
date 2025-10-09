# Contributing to APIViz

Thank you for your interest in contributing to APIViz! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 16+
- VSCode 1.74+
- TypeScript 4.9+
- Git

### Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/apiviz.git
   cd apiviz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run compile
   ```

4. **Start development mode**:
   ```bash
   npm run dev
   ```

This will start both the VSCode extension in watch mode and the agent server.

## Project Structure

```
apiviz/
├── src/                    # VSCode extension source
│   ├── extension.ts       # Main extension entry point
│   ├── providers/         # Tree view providers
│   ├── services/          # Core services
│   ├── views/            # Webview components
│   ├── commands/         # Command handlers
│   └── types/            # TypeScript definitions
├── agent/                 # Local agent server
│   ├── src/              # Agent source code
│   └── services/         # Agent services
├── instrumentation/       # Client instrumentation
│   ├── node/             # Node.js instrumentation
│   ├── browser/          # Browser instrumentation
│   └── examples/         # Example implementations
└── docs/                 # Documentation
```

## Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**:
   ```bash
   git commit -m "feat: add your feature description"
   ```

### Code Style

- Use TypeScript for all new code
- Follow the existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

- Write unit tests for new functionality
- Test the extension in VSCode
- Test the agent server independently
- Test instrumentation with real applications

## Areas for Contribution

### High Priority

- **Performance Optimization**: Improve data processing and UI responsiveness
- **Additional Instrumentation**: Support for more HTTP clients and frameworks
- **Enhanced Visualizations**: More chart types and data views
- **Configuration UI**: Better settings management interface

### Medium Priority

- **GraphQL Support**: Instrument GraphQL queries and mutations
- **Database Monitoring**: Track database query performance
- **Alert System**: Notifications for performance issues
- **Team Features**: Shared dashboards and collaboration

### Low Priority

- **Export Formats**: Support for CSV, Excel, and other formats
- **Integration APIs**: REST API for external tools
- **Themes**: Customizable UI themes
- **Plugins**: Plugin system for extensions

## Bug Reports

When reporting bugs, please include:

1. **VSCode version**
2. **APIViz version**
3. **Operating system**
4. **Steps to reproduce**
5. **Expected behavior**
6. **Actual behavior**
7. **Error messages or logs**

## Feature Requests

When requesting features, please include:

1. **Use case description**
2. **Proposed solution**
3. **Alternative solutions considered**
4. **Additional context**

## Pull Request Process

1. **Ensure your branch is up to date**:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Create a pull request**:
   - Use a descriptive title
   - Provide a detailed description
   - Link any related issues
   - Include screenshots for UI changes

3. **Respond to feedback**:
   - Address review comments promptly
   - Make requested changes
   - Update tests and documentation

## Release Process

Releases are managed by maintainers:

1. **Version bumping**: Update version in package.json
2. **Changelog**: Update CHANGELOG.md
3. **Testing**: Comprehensive testing across platforms
4. **Publishing**: Publish to VSCode marketplace

## Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check the docs/ folder for guides

## License

By contributing to APIViz, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to APIViz! 🚀
