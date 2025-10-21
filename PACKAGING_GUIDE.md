# APIViz Extension - Packaging and Installation Guide

This guide will walk you through packaging your APIViz extension and installing it locally in VS Code.

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **npm** (comes with Node.js)
3. **VS Code** (version 1.74.0 or higher)
4. **vsce** (Visual Studio Code Extension manager)

## Step 1: Install vsce (if not already installed)

```bash
npm install -g vsce
```

## Step 2: Prepare for Packaging

### 2.1 Build the Extension

First, compile your TypeScript code:

```bash
npm run compile
```

This will create the `out/` directory with compiled JavaScript files.

### 2.2 Build the Agent (if needed)

If you have an agent component, build it:

```bash
npm run agent:build
```

### 2.3 Verify Package.json

Ensure your `package.json` has the correct:
- `main` field pointing to `./out/extension.js`
- `files` field including necessary files
- `publisher` field (you can use your own name or organization)

## Step 3: Package the Extension

### 3.1 Create the VSIX Package

```bash
npm run package
```

This will create a `.vsix` file in your project root (e.g., `apiviz-0.1.0.vsix`).

### 3.2 Alternative: Manual Packaging

If the npm script doesn't work, you can package manually:

```bash
vsce package
```

## Step 4: Install the Extension Locally

### Method 1: Install from VSIX File (Recommended)

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Click the "..." menu in the Extensions view
4. Select "Install from VSIX..."
5. Navigate to your `.vsix` file and select it
6. Click "Install"

### Method 2: Command Line Installation

```bash
code --install-extension apiviz-0.1.0.vsix
```

### Method 3: Development Mode (for testing)

For development and testing, you can run the extension in a new VS Code window:

1. Open your project in VS Code
2. Press `F5` or go to Run > Start Debugging
3. This opens a new "Extension Development Host" window with your extension loaded

## Step 5: Verify Installation

1. In VS Code, go to Extensions view
2. Search for "APIViz" or "apiviz"
3. You should see your extension listed
4. Check that it shows as "Installed"

## Step 6: Test the Extension

1. Open a project in VS Code
2. Look for the APIViz icon in the Activity Bar (left sidebar)
3. Try the commands:
   - `Ctrl+Shift+P` → "APIViz: Start API Monitoring"
   - `Ctrl+Shift+P` → "APIViz: Stop API Monitoring"
   - `Ctrl+Shift+P` → "APIViz: Open AI Insights"

## Troubleshooting

### Common Issues

1. **Extension not appearing**: Check that the `main` field in `package.json` points to the correct compiled file
2. **Commands not working**: Verify that commands are properly registered in `package.json`
3. **Build errors**: Ensure all dependencies are installed with `npm install`

### Debug Mode

To debug issues:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Developer: Toggle Developer Tools"
3. Check the Console tab for error messages

### Logs

Extension logs are available in:
- **Windows**: `%USERPROFILE%\.vscode\extensions\apiviz-*\out\`
- **macOS**: `~/.vscode/extensions/apiviz-*/out/`
- **Linux**: `~/.vscode/extensions/apiviz-*/out/`

## Publishing to Marketplace (Optional)

If you want to publish to the VS Code Marketplace:

1. Create a publisher account at https://marketplace.visualstudio.com/
2. Get a Personal Access Token
3. Login with vsce: `vsce login <publisher-name>`
4. Publish: `vsce publish`

## Development Workflow

For ongoing development:

1. Make changes to your code
2. Run `npm run compile` to build
3. Press `F5` to test in Extension Development Host
4. When ready, package with `npm run package`
5. Install the new `.vsix` file

## File Structure After Packaging

Your packaged extension will include:
```
apiviz-0.1.0.vsix
├── extension.js (compiled from src/extension.ts)
├── package.json
├── README.md
├── CHANGELOG.md
├── media/ (if any)
└── out/ (compiled TypeScript files)
```

## Configuration

After installation, users can configure the extension through VS Code settings:
- `Ctrl+,` → Search for "APIViz"
- Configure agent port, sampling rate, etc.

## Support

For issues or questions:
1. Check the VS Code Developer Console for errors
2. Verify all dependencies are properly installed
3. Ensure the agent server is running (if applicable)
4. Check the extension's output channel in VS Code
