# APIViz User Guide

**Version 0.1.0**

Welcome to APIViz - your real-time API performance monitoring solution for VS Code!

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Features](#features)
- [Configuration](#configuration)
- [Commands](#commands)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Introduction

APIViz is a VS Code extension that helps developers monitor and optimize API performance in real-time. It provides:

- **Real-time latency tracking** for all API calls
- **Visual performance data** through charts and graphs
- **AI-powered insights** for optimization recommendations
- **Non-invasive monitoring** that doesn't modify your code

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Click the Extensions icon (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "APIViz"
4. Click **Install**
5. Reload VS Code when prompted

### From VSIX File

1. Download the `apiviz-0.1.0.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Extensions: Install from VSIX..."
5. Select the downloaded `.vsix` file
6. Reload VS Code

### Verification

After installation, you should see:
- APIViz icon in the Activity Bar (left sidebar)
- "APIViz extension activated successfully!" notification
- APIViz commands in Command Palette

## Getting Started

### Quick Start (5 Minutes)

**Step 1: Activate the Extension**
- Look for the 📊 APIViz icon in the Activity Bar (left sidebar)
- Click it to open the APIViz panel

**Step 2: Start Monitoring**
- Press `Ctrl+Shift+P` to open Command Palette
- Type `APIViz: Start API Monitoring`
- Press Enter

**Step 3: View Your Data**
- The APIViz panel shows:
  - Live Latency view
  - Endpoints view
  - AI Insights view
  - Team Leaderboard

**Step 4: Explore Features**
- Click different views to explore
- Check the status bar for monitoring status
- Open settings to customize (`Ctrl+,` → Search "APIViz")

## Features

### 1. Activity Bar Integration

Click the APIViz icon in the Activity Bar to access:

#### Live Latency View
- Real-time API call performance
- Color-coded indicators:
  - 🟢 Green: Fast (< 100ms)
  - 🟡 Yellow: Medium (100-300ms)
  - 🔴 Red: Slow (> 300ms)

#### Endpoints View
- List of all monitored endpoints
- Average latency per endpoint
- Request count and success rate

#### AI Insights View
- Performance recommendations
- Bottleneck detection
- Optimization suggestions

#### Team Leaderboard
- Team performance metrics
- Collaborative features
- Performance comparisons

### 2. Command Palette Commands

Access via `Ctrl+Shift+P`:

| Command | Keyboard Shortcut | Description |
|---------|------------------|-------------|
| APIViz: Start API Monitoring | - | Begin monitoring API calls |
| APIViz: Stop API Monitoring | - | Stop monitoring |
| APIViz: Clear Data | - | Clear all collected data |
| APIViz: Open AI Insights | - | View detailed AI analysis |
| APIViz: Open Advanced Visualizations | - | Open charts panel |
| APIViz: Open Predictive Analytics | - | View ML predictions |
| APIViz: Open Social Sharing | - | Share with team |
| APIViz: Open Settings | - | Configure APIViz |

### 3. Status Bar

The status bar (bottom of VS Code) shows:
- Current monitoring status
- Average API latency
- Active endpoint count

### 4. Inline Decorations (Optional)

When enabled, latency information appears next to API calls in your code:

```javascript
fetch('/api/users')  // ← 45ms ✅
  .then(response => response.json());
```

Toggle in settings: `apiviz.showInlineDecorations`

### 5. Webview Panels

#### AI Insights Panel
- Detailed performance analysis
- Trend detection
- Actionable recommendations

#### Advanced Visualizations
- Performance charts and graphs
- Historical data visualization
- Export capabilities

#### Predictive Analytics
- ML-based performance predictions
- Future trend forecasting
- Resource optimization suggestions

#### Social Sharing
- Share performance data with team
- Collaborative analysis
- Team challenges and leaderboards

## Configuration

### Accessing Settings

1. Press `Ctrl+,` (or `Cmd+,` on Mac)
2. Search for "APIViz"
3. Modify settings as needed

### Available Settings

#### `apiviz.agentPort`
- **Type**: Number
- **Default**: 3001
- **Description**: Port for the local APIViz agent server

#### `apiviz.samplingRate`
- **Type**: Number (0.1 - 1.0)
- **Default**: 1.0
- **Description**: Percentage of API calls to monitor (1.0 = 100%)

#### `apiviz.minLatencyThreshold`
- **Type**: Number
- **Default**: 10
- **Description**: Minimum latency in milliseconds to track (calls below are ignored)

#### `apiviz.maxDataPoints`
- **Type**: Number
- **Default**: 1000
- **Description**: Maximum data points to keep in memory

#### `apiviz.autoStart`
- **Type**: Boolean
- **Default**: false
- **Description**: Automatically start monitoring when VS Code opens

#### `apiviz.showInlineDecorations`
- **Type**: Boolean
- **Default**: true
- **Description**: Show latency information next to API calls in code

#### `apiviz.endpointFilters`
- **Type**: Array of strings
- **Default**: `["/api/*"]`
- **Description**: URL patterns to monitor (supports wildcards)
- **Examples**:
  ```json
  {
    "apiviz.endpointFilters": [
      "/api/*",
      "https://api.example.com/*",
      "/graphql",
      "*/users"
    ]
  }
  ```

### Example Configuration

Add to your `settings.json`:

```json
{
  "apiviz.agentPort": 3001,
  "apiviz.samplingRate": 1.0,
  "apiviz.minLatencyThreshold": 10,
  "apiviz.maxDataPoints": 1000,
  "apiviz.autoStart": true,
  "apiviz.showInlineDecorations": true,
  "apiviz.endpointFilters": [
    "/api/*",
    "/graphql"
  ]
}
```

## Commands

### Start API Monitoring

**Command**: `APIViz: Start API Monitoring`

Begins monitoring API calls in your application.

**What happens:**
- WebSocket connection established
- Status bar shows "Monitoring"
- Live data appears in views
- Inline decorations enabled (if configured)

### Stop API Monitoring

**Command**: `APIViz: Stop API Monitoring`

Stops monitoring and closes connections.

**What happens:**
- WebSocket connection closed
- Status bar shows "Stopped"
- Data remains visible (not cleared)

### Clear Data

**Command**: `APIViz: Clear Data`

Removes all collected latency data.

**Use when:**
- Starting fresh analysis
- Testing different scenarios
- Clearing old data

### Open AI Insights

**Command**: `APIViz: Open AI Insights`

Opens detailed AI-powered analysis panel.

**Shows:**
- Performance trends
- Bottleneck identification
- Optimization recommendations
- Anomaly detection

### Open Advanced Visualizations

**Command**: `APIViz: Open Advanced Visualizations`

Opens charts and graphs panel.

**Features:**
- Real-time performance charts
- Historical trend analysis
- Comparative visualizations
- Export to image/PDF

### Open Predictive Analytics

**Command**: `APIViz: Open Predictive Analytics`

Opens ML-based prediction panel.

**Shows:**
- Future performance predictions
- Resource usage forecasts
- Optimization opportunities
- Proactive recommendations

### Open Social Sharing

**Command**: `APIViz: Open Social Sharing`

Opens team collaboration panel.

**Features:**
- Share performance data
- Team challenges
- Leaderboards
- Collaborative analysis

### Open Settings

**Command**: `APIViz: Open Settings`

Quick access to APIViz configuration.

## Troubleshooting

### Extension Not Appearing

**Problem**: APIViz icon not visible in Activity Bar

**Solutions:**
1. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
2. Check Extensions view - ensure APIViz is enabled
3. Verify installation: `Ctrl+Shift+X` → Search "APIViz"

### Commands Not Working

**Problem**: "Command not found" error

**Solutions:**
1. Reload VS Code completely (close all windows, reopen)
2. Reinstall extension
3. Check Output panel (`View` → `Output` → Select "APIViz")
4. Check Developer Console (`Help` → `Toggle Developer Tools`)

### No Data Showing

**Problem**: Views are empty

**Solutions:**
1. Ensure monitoring is started (`APIViz: Start API Monitoring`)
2. Check agent port configuration (default: 3001)
3. Verify endpoint filters match your API URLs
4. Check sampling rate (set to 1.0 for 100%)

### Performance Issues

**Problem**: VS Code running slow

**Solutions:**
1. Reduce `maxDataPoints` setting (e.g., 500)
2. Lower `samplingRate` (e.g., 0.5 for 50%)
3. Increase `minLatencyThreshold` to ignore fast calls
4. Clear old data (`APIViz: Clear Data`)

### Agent Connection Failed

**Problem**: "Failed to connect to agent" error

**Solutions:**
1. Check agent port is not in use
2. Verify firewall settings
3. Try different port in settings
4. Restart VS Code

## FAQ

### Q: Does APIViz modify my code?

**A**: No. APIViz is completely non-invasive and only monitors your API calls without modifying any source code.

### Q: What programming languages are supported?

**A**: APIViz works with JavaScript, TypeScript, Node.js, and any language making HTTP requests visible to the extension.

### Q: Does it work with all HTTP clients?

**A**: Yes. APIViz monitors at the network level and works with fetch, axios, XMLHttpRequest, and other HTTP clients.

### Q: Is my data sent anywhere?

**A**: No. All data stays local on your machine. APIViz processes everything locally and doesn't send data to external servers.

### Q: Can I use this in production?

**A**: APIViz is designed for development environments. While it has minimal performance impact, it's recommended for development and testing.

### Q: How do I export data?

**A**: Use the Advanced Visualizations panel (`APIViz: Open Advanced Visualizations`) and click the export button.

### Q: Can multiple team members use this together?

**A**: Yes. Use the Social Sharing feature (`APIViz: Open Social Sharing`) for team collaboration.

### Q: What's the performance impact?

**A**: Minimal. APIViz uses efficient data collection with configurable sampling rates. Typical overhead is < 1%.

### Q: Can I monitor GraphQL queries?

**A**: Currently HTTP/REST is fully supported. GraphQL support is on the roadmap.

### Q: How do I update the extension?

**A**: VS Code will notify you of updates. Click "Update" when prompted, or reinstall from VSIX file.

## Support

### Getting Help

- **Documentation**: Check `README.md` and this User Guide
- **Issues**: Report bugs and request features on GitHub
- **Community**: Join discussions and share tips

### Useful Resources

- [README.md](README.md) - Overview and quick start
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [LICENSE](LICENSE) - License information

---

**Thank you for using APIViz!** 🚀

We hope this extension helps you build faster, more performant applications.
