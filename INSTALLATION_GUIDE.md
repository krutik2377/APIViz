# APIViz Extension - Installation Guide

This guide provides step-by-step instructions for installing the APIViz extension locally in VS Code.

## Quick Start

### Option 1: Install from VSIX File (Recommended)

1. **Download the extension package**
   - Get the `apiviz-0.1.0.vsix` file from the project

2. **Install in VS Code**
   - Open VS Code
   - Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
   - Click the "..." menu (three dots) in the Extensions view
   - Select "Install from VSIX..."
   - Navigate to and select your `apiviz-0.1.0.vsix` file
   - Click "Install"

3. **Reload VS Code**
   - VS Code will prompt you to reload the window
   - Click "Reload Now"

### Option 2: Command Line Installation

1. **Open Command Prompt/Terminal**
2. **Navigate to the directory containing the .vsix file**
3. **Run the installation command:**
   ```bash
   code --install-extension apiviz-0.1.0.vsix
   ```

## Verification Steps

### 1. Check Extension Installation

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Search for "APIViz" or "apiviz"
4. Verify the extension is listed and shows "Installed"

### 2. Verify Extension Features

1. **Check Activity Bar**
   - Look for the APIViz icon (pulse symbol) in the left sidebar
   - Click on it to open the APIViz panel

2. **Test Commands**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "APIViz" to see available commands:
     - `APIViz: Start API Monitoring`
     - `APIViz: Stop API Monitoring`
     - `APIViz: Open AI Insights`
     - `APIViz: Open Advanced Visualizations`
     - `APIViz: Open Social Sharing`
     - `APIViz: Open Predictive Analytics`

3. **Check Views**
   - In the APIViz panel, you should see:
     - Live Latency
     - Endpoints
     - AI Insights
     - Team Leaderboard

## Configuration

### Access Settings

1. Press `Ctrl+,` (or `Cmd+,` on Mac) to open Settings
2. Search for "APIViz"
3. Configure the following options:

### Available Settings

- **Agent Port**: Port for the local APIViz agent server (default: 3001)
- **Sampling Rate**: Percentage of API calls to monitor (default: 100%)
- **Min Latency Threshold**: Minimum latency to track in milliseconds (default: 10ms)
- **Max Data Points**: Maximum data points to keep in memory (default: 1000)
- **Auto Start**: Automatically start monitoring when extension activates
- **Show Inline Decorations**: Show latency info inline next to API calls
- **Endpoint Filters**: URL patterns to monitor (supports wildcards)

## First-Time Setup

### 1. Start the Agent (if applicable)

If your extension requires a local agent:

1. Open a terminal in your project directory
2. Run: `npm run agent:dev` or `npm run agent:build`
3. Ensure the agent is running on the configured port (default: 3001)

### 2. Start Monitoring

1. Open a project in VS Code
2. Press `Ctrl+Shift+P`
3. Run "APIViz: Start API Monitoring"
4. You should see a success message

### 3. Test with API Calls

1. Make some API calls in your code
2. Check the APIViz panel for latency data
3. Verify inline decorations appear next to API calls

## Troubleshooting

### Extension Not Appearing

1. **Check Installation**
   ```bash
   code --list-extensions | grep apiviz
   ```

2. **Reinstall if needed**
   ```bash
   code --uninstall-extension apiviz
   code --install-extension apiviz-0.1.0.vsix
   ```

### Commands Not Working

1. **Check Developer Console**
   - Press `Ctrl+Shift+P`
   - Run "Developer: Toggle Developer Tools"
   - Check Console tab for errors

2. **Check Extension Output**
   - Go to View → Output
   - Select "APIViz" from the dropdown

### No Data Appearing

1. **Verify Agent Connection**
   - Check if the agent is running
   - Verify the port configuration
   - Check network connectivity

2. **Check Configuration**
   - Ensure endpoint filters are correct
   - Verify sampling rate is not 0
   - Check latency threshold settings

### Performance Issues

1. **Reduce Data Points**
   - Lower the "Max Data Points" setting
   - Increase the "Min Latency Threshold"

2. **Adjust Sampling Rate**
   - Reduce sampling rate for high-traffic applications

## Uninstalling

### Method 1: VS Code UI

1. Go to Extensions view (`Ctrl+Shift+X`)
2. Find "APIViz" extension
3. Click the gear icon
4. Select "Uninstall"

### Method 2: Command Line

```bash
code --uninstall-extension apiviz
```

## Development Mode

For developers working on the extension:

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Build the extension**
   ```bash
   npm run compile
   ```
4. **Run in development mode**
   - Press `F5` in VS Code
   - This opens a new Extension Development Host window

## Support

### Getting Help

1. **Check Logs**
   - View → Output → Select "APIViz"
   - Check Developer Console for errors

2. **Report Issues**
   - Include VS Code version
   - Include extension version
   - Include error messages from console

### System Requirements

- **VS Code**: Version 1.74.0 or higher
- **Node.js**: Version 16 or higher (for agent)
- **Operating System**: Windows, macOS, or Linux

## Next Steps

After successful installation:

1. **Configure your project** for API monitoring
2. **Set up endpoint filters** to monitor specific APIs
3. **Explore AI insights** and predictive analytics
4. **Share performance data** with your team
5. **Set up alerts** for performance issues

## Additional Resources

- [APIViz Documentation](README.md)
- [Configuration Guide](PACKAGING_GUIDE.md)
- [API Reference](docs/)
- [Changelog](CHANGELOG.md)
