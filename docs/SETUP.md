# APIViz Setup Guide

This guide will help you set up and use APIViz for real-time API latency monitoring in VSCode.

## Prerequisites

- **VSCode**: Version 1.74.0 or higher
- **Node.js**: Version 16 or higher
- **TypeScript**: Version 4.9 or higher

## Installation

### Option 1: Install from VSCode Marketplace (Coming Soon)

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "APIViz"
4. Click Install

### Option 2: Build from Source

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd apiviz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run compile
   ```

4. Package the extension:
   ```bash
   npm run package
   ```

5. Install the .vsix file in VSCode:
   - Open VSCode
   - Go to Extensions
   - Click the "..." menu
   - Select "Install from VSIX..."
   - Choose the generated .vsix file

## Quick Start

### 1. Start the Agent Server

The APIViz agent server needs to be running to collect API metrics.

```bash
# From the project root
npm run agent:dev
```

The agent will start on `http://localhost:3001` by default.

### 2. Instrument Your Application

#### For Node.js Applications

Add APIViz instrumentation to your Node.js application:

```javascript
// Method 1: Auto-instrument all HTTP calls
const { instrumentHttp } = require('apiviz-agent');
instrumentHttp({
    agentUrl: 'http://localhost:3001',
    samplingRate: 1.0,
    minLatencyThreshold: 10,
    endpointFilters: ['/api/*'],
    enableLogging: true
});
```

#### For Express Applications

```javascript
const express = require('express');
const { createExpressMiddleware } = require('apiviz-agent');

const app = express();

// Add APIViz middleware
app.use(createExpressMiddleware({
    agentUrl: 'http://localhost:3001',
    samplingRate: 1.0,
    minLatencyThreshold: 10,
    endpointFilters: ['/api/*'],
    enableLogging: true
}));

// Your routes...
app.get('/api/users', (req, res) => {
    res.json({ users: [] });
});
```

#### For Browser Applications

```html
<script src="apiviz-browser.js"></script>
<script>
    // Auto-instrument all HTTP calls
    APIViz.instrumentAll({
        agentUrl: 'http://localhost:3001',
        samplingRate: 1.0,
        minLatencyThreshold: 10,
        endpointFilters: ['/api/*'],
        enableLogging: true
    });
</script>
```

### 3. Start Monitoring in VSCode

1. Open VSCode with your project
2. Open the APIViz sidebar (click the APIViz icon in the activity bar)
3. Click "Start API Monitoring"
4. Make some API calls in your application
5. Watch the real-time latency data appear in VSCode!

## Configuration

### VSCode Settings

Configure APIViz through VSCode settings (File > Preferences > Settings):

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

### Environment Variables

Configure the agent server using environment variables:

```bash
export APIVIZ_PORT=3001
export APIVIZ_SAMPLING_RATE=1.0
export APIVIZ_MIN_LATENCY_THRESHOLD=10
export APIVIZ_MAX_DATA_POINTS=10000
export APIVIZ_LOG_LEVEL=info
```

## Features

### Real-time Monitoring

- **Live Latency Tracking**: See API call latency in real-time
- **Performance Metrics**: Average, 95th percentile, max latency
- **Error Rate Monitoring**: Track failed requests
- **Endpoint Statistics**: Per-endpoint performance data

### VSCode Integration

- **Sidebar Views**: Live latency and endpoint data
- **Inline Decorations**: Latency shown next to API calls in code
- **Status Bar**: Real-time average latency display
- **Performance Charts**: Interactive charts and graphs
- **Command Palette**: Quick access to all features

### Data Visualization

- **Time-series Charts**: Latency over time
- **Bar Charts**: Endpoint performance comparison
- **Status Indicators**: Health status for each endpoint
- **Export/Import**: Save and load performance data

## Troubleshooting

### Agent Not Connecting

1. **Check if agent is running**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verify port configuration**:
   - Default port is 3001
   - Check VSCode settings for `apiviz.agentPort`
   - Ensure no firewall blocking the port

3. **Check agent logs**:
   ```bash
   npm run agent:dev
   ```

### No Data Appearing

1. **Verify instrumentation**:
   - Ensure APIViz instrumentation is added to your code
   - Check that API calls match your endpoint filters
   - Verify sampling rate is not 0

2. **Check endpoint filters**:
   - Default filter is `/api/*`
   - Adjust `apiviz.endpointFilters` in settings
   - Use wildcards: `/api/*`, `/v1/**`, etc.

3. **Verify latency threshold**:
   - Default minimum is 10ms
   - Calls below threshold are ignored
   - Adjust `apiviz.minLatencyThreshold` if needed

### Performance Issues

1. **Reduce sampling rate**:
   ```json
   {
       "apiviz.samplingRate": 0.1
   }
   ```

2. **Limit data points**:
   ```json
   {
       "apiviz.maxDataPoints": 1000
   }
   ```

3. **Disable inline decorations**:
   ```json
   {
       "apiviz.showInlineDecorations": false
   }
   ```

## Examples

### Example Node.js Server

See `instrumentation/examples/node-example.js` for a complete example.

### Example Browser Application

See `instrumentation/examples/browser-example.html` for a complete example.

## Support

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions for help and tips

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.
