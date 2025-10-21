# APIViz Extension - Development Setup Guide

This guide will help you set up the development environment for the APIViz VS Code extension.

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **VS Code** (version 1.74.0 or higher)
- **Git** (for version control)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd VsCodeExtention

# Install dependencies
npm install

# Install agent dependencies
npm run postinstall
```

### 2. Development Mode

```bash
# Start development mode (compiles and watches for changes)
npm run dev
```

This will:
- Compile TypeScript files and watch for changes
- Start the agent in development mode
- Run both processes concurrently

### 3. Test in VS Code

1. Open the project in VS Code
2. Press `F5` or go to **Run > Start Debugging**
3. This opens a new "Extension Development Host" window
4. Your extension will be loaded in this new window

## Development Workflow

### Making Changes

1. **Edit TypeScript files** in the `src/` directory
2. **Save files** - TypeScript will auto-compile (if using `npm run dev`)
3. **Reload the Extension Development Host** window:
   - Press `Ctrl+R` (or `Cmd+R` on Mac) in the Extension Development Host window
   - Or close and reopen the window with `F5`

### Testing Changes

1. **Test commands**: Press `Ctrl+Shift+P` and search for "APIViz"
2. **Check console**: Open Developer Tools (`Ctrl+Shift+I`) to see logs
3. **Verify functionality**: Test all features in the Extension Development Host

### Building for Production

```bash
# Compile TypeScript
npm run compile

# Package extension
npm run package
```

## Project Structure

```
src/
├── extension.ts              # Main extension entry point
├── commands/                 # Command handlers
│   └── index.ts
├── providers/                # Tree data providers
│   ├── LatencyProvider.ts
│   ├── EndpointsProvider.ts
│   ├── AIInsightsProvider.ts
│   └── TeamLeaderboardProvider.ts
├── services/                 # Core services
│   ├── WebSocketService.ts
│   ├── DataProcessor.ts
│   ├── ConfigurationManager.ts
│   ├── InlineDecorator.ts
│   ├── StatusBarManager.ts
│   ├── TeamService.ts
│   ├── AIPerformanceAnalyzer.ts
│   ├── MLPredictiveEngine.ts
│   └── SmartAlertingSystem.ts
├── views/                    # Webview panels
│   ├── AIInsightsWebview.ts
│   ├── AdvancedVisualizations.ts
│   ├── ChartsWebview.ts
│   ├── PredictiveAnalyticsWebview.ts
│   └── SocialSharingWebview.ts
└── types/                    # TypeScript type definitions
    └── index.ts

agent/                        # Local agent server
├── src/
│   ├── index.ts
│   └── services/
└── package.json

instrumentation/              # Browser/Node.js instrumentation
├── browser/
├── node/
└── examples/
```

## Available Scripts

### Main Scripts

- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and recompile
- `npm run dev` - Development mode (compile + agent)
- `npm run package` - Create VSIX package
- `npm run lint` - Run ESLint

### Agent Scripts

- `npm run agent:dev` - Start agent in development mode
- `npm run agent:build` - Build agent for production
- `npm run postinstall` - Install agent dependencies

## Configuration

### VS Code Settings

The extension can be configured through VS Code settings:

```json
{
  "apiviz.agentPort": 3001,
  "apiviz.samplingRate": 1.0,
  "apiviz.minLatencyThreshold": 10,
  "apiviz.maxDataPoints": 1000,
  "apiviz.autoStart": false,
  "apiviz.showInlineDecorations": true,
  "apiviz.endpointFilters": ["/api/*"]
}
```

### Development Configuration

Create a `.vscode/settings.json` file for development:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Debugging

### Extension Debugging

1. **Set breakpoints** in your TypeScript files
2. **Press F5** to start debugging
3. **Use VS Code debugger** in the Extension Development Host

### Console Logging

```typescript
// Use console.log for debugging
console.log('Debug message');

// Use VS Code's output channel
const outputChannel = vscode.window.createOutputChannel('APIViz');
outputChannel.appendLine('Debug message');
```

### Common Debug Scenarios

1. **Extension not loading**: Check the Developer Console for errors
2. **Commands not working**: Verify command registration in `package.json`
3. **WebSocket connection issues**: Check agent server status
4. **UI not updating**: Verify data flow through providers

## Testing

### Manual Testing

1. **Test all commands** through Command Palette
2. **Verify tree views** update correctly
3. **Check webview panels** load and function
4. **Test configuration changes** take effect
5. **Verify error handling** works properly

### Automated Testing

```bash
# Run tests (if implemented)
npm test

# Run linting
npm run lint
```

## Packaging and Distribution

### Local Installation

```bash
# Package the extension
npm run package

# Install locally
code --install-extension apiviz-0.1.0.vsix
```

### Publishing to Marketplace

1. **Create publisher account** at https://marketplace.visualstudio.com/
2. **Get Personal Access Token**
3. **Login with vsce**:
   ```bash
   vsce login <publisher-name>
   ```
4. **Publish**:
   ```bash
   vsce publish
   ```

## Troubleshooting

### Common Issues

1. **TypeScript compilation errors**:
   - Check `tsconfig.json` configuration
   - Ensure all imports are correct
   - Verify type definitions

2. **Extension not activating**:
   - Check `package.json` activation events
   - Verify main entry point exists
   - Check for runtime errors in console

3. **Agent connection issues**:
   - Ensure agent is running on correct port
   - Check firewall settings
   - Verify WebSocket connection

4. **Performance issues**:
   - Monitor memory usage
   - Check for memory leaks
   - Optimize data processing

### Getting Help

1. **Check VS Code Developer Console** for errors
2. **Review extension logs** in Output panel
3. **Test in clean VS Code instance**
4. **Check GitHub issues** for similar problems

## Best Practices

### Code Organization

- Keep services focused and single-purpose
- Use TypeScript interfaces for type safety
- Implement proper error handling
- Add JSDoc comments for complex functions

### Performance

- Minimize memory usage
- Use efficient data structures
- Implement proper cleanup in `deactivate()`
- Avoid blocking the main thread

### User Experience

- Provide clear error messages
- Implement proper loading states
- Use consistent UI patterns
- Follow VS Code design guidelines

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Code Style

- Follow existing code patterns
- Use TypeScript strict mode
- Add proper error handling
- Include JSDoc for public APIs

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/ux-guidelines/overview)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
