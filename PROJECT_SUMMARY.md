# APIViz - Project Summary

## 🚀 Project Overview

APIViz is a comprehensive VSCode extension that provides **real-time API latency monitoring and visualization** directly in your development environment. It's designed to help developers identify performance bottlenecks, track API call patterns, and optimize their applications.

## ✨ Key Features Implemented

### 1. **Real-time Monitoring**
- Live tracking of HTTP request latency
- WebSocket-based communication between agent and extension
- Automatic data collection and processing
- Configurable sampling rates and thresholds

### 2. **VSCode Integration**
- **Sidebar Views**: Live latency data and endpoint statistics
- **Inline Decorations**: Latency displayed next to API calls in code
- **Status Bar**: Real-time average latency indicator
- **Command Palette**: Quick access to all features
- **Performance Charts**: Interactive visualizations with Chart.js

### 3. **Multi-Platform Instrumentation**
- **Node.js**: HTTP client instrumentation (fetch, XMLHttpRequest, axios)
- **Browser**: Frontend API call monitoring
- **Express Middleware**: Easy integration for Express applications
- **Configurable Filters**: Endpoint pattern matching

### 4. **Data Visualization**
- Time-series charts for latency trends
- Bar charts for endpoint performance comparison
- Status indicators (healthy/warning/error)
- Export/import functionality for data analysis

### 5. **Configuration & Customization**
- VSCode settings integration
- Environment variable support
- Configurable sampling rates
- Endpoint filtering with wildcards
- Performance thresholds

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    HTTP/WS    ┌─────────────────┐
│   Your App      │◄──────────────►│  APIViz Agent   │◄─────────────►│  VSCode Ext     │
│  (Instrumented) │                 │  (Local Server) │                │  (Visualization)│
└─────────────────┘                 └─────────────────┘                └─────────────────┘
```

### Components

1. **VSCode Extension** (`src/`)
   - Main extension entry point
   - Tree view providers for data display
   - WebSocket service for real-time communication
   - Inline decorators for code annotations
   - Status bar integration
   - Webview panels for charts

2. **Agent Server** (`agent/`)
   - Express.js server for data collection
   - WebSocket manager for real-time updates
   - Metrics collector and processor
   - Configuration management
   - REST API endpoints

3. **Instrumentation** (`instrumentation/`)
   - Node.js HTTP client wrapping
   - Browser fetch/XMLHttpRequest instrumentation
   - Express middleware
   - Example implementations

## 📁 Project Structure

```
apiviz/
├── src/                    # VSCode extension source
│   ├── extension.ts       # Main extension entry point
│   ├── providers/         # Tree view providers
│   ├── services/          # Core services (WebSocket, data processing)
│   ├── views/            # Webview components
│   ├── commands/         # Command handlers
│   └── types/            # TypeScript definitions
├── agent/                 # Local agent server
│   ├── src/              # Agent source code
│   ├── services/         # Agent services
│   └── types/            # Agent type definitions
├── instrumentation/       # Client instrumentation
│   ├── node/             # Node.js instrumentation
│   ├── browser/          # Browser instrumentation
│   └── examples/         # Example implementations
├── docs/                 # Documentation
├── .vscode/              # VSCode configuration
└── Configuration files   # Package.json, tsconfig.json, etc.
```

## 🛠️ Technology Stack

- **Language**: TypeScript
- **Extension Framework**: VSCode Extension API
- **Agent Server**: Node.js + Express.js
- **Real-time Communication**: WebSocket (ws library)
- **Data Visualization**: Chart.js
- **HTTP Instrumentation**: Custom middleware and wrappers
- **Build Tools**: TypeScript compiler, ESLint

## 🚀 Getting Started

### Quick Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the agent server**:
   ```bash
   npm run agent:dev
   ```

3. **Build and run the extension**:
   ```bash
   npm run compile
   # Open VSCode and press F5 to run the extension
   ```

4. **Instrument your application**:
   ```javascript
   const { instrumentHttp } = require('apiviz-agent');
   instrumentHttp();
   ```

### Example Usage

```javascript
// Node.js application
const { instrumentHttp } = require('apiviz-agent');
instrumentHttp({
    agentUrl: 'http://localhost:3001',
    samplingRate: 1.0,
    endpointFilters: ['/api/*']
});

// Make API calls
fetch('/api/users').then(response => response.json());
```

## 📊 Features in Detail

### Real-time Data Collection
- Automatic HTTP request interception
- Latency measurement with high precision
- Error tracking and status code monitoring
- Configurable data retention and sampling

### VSCode UI Components
- **Live Latency View**: Real-time API call data
- **Endpoint Performance**: Per-endpoint statistics
- **Performance Charts**: Interactive visualizations
- **Inline Decorations**: Code-level latency display
- **Status Bar**: Quick performance overview

### Data Management
- In-memory data storage with configurable limits
- Export/import functionality for data analysis
- Real-time data streaming via WebSocket
- Automatic data cleanup and optimization

## 🔧 Configuration Options

### VSCode Settings
```json
{
    "apiviz.agentPort": 3001,
    "apiviz.samplingRate": 1.0,
    "apiviz.minLatencyThreshold": 10,
    "apiviz.showInlineDecorations": true,
    "apiviz.endpointFilters": ["/api/*"]
}
```

### Environment Variables
```bash
export APIVIZ_PORT=3001
export APIVIZ_SAMPLING_RATE=1.0
export APIVIZ_MIN_LATENCY_THRESHOLD=10
```

## 🎯 Use Cases

1. **Performance Debugging**: Identify slow API calls in real-time
2. **Development Monitoring**: Track API performance during development
3. **Code Optimization**: See latency impact of code changes
4. **API Testing**: Monitor performance during testing
5. **Team Collaboration**: Share performance insights with team members

## 🚧 Future Enhancements

- GraphQL support
- Database query monitoring
- Performance alerts and notifications
- Team collaboration features
- Integration with popular monitoring tools
- Plugin system for extensions

## 📈 Impact & Benefits

- **Developer Productivity**: Immediate feedback on API performance
- **Code Quality**: Real-time visibility into performance impact
- **Debugging Efficiency**: Quick identification of performance bottlenecks
- **Team Collaboration**: Shared performance insights
- **Learning**: Understanding of API call patterns and performance

## 🏆 Technical Achievements

- **Real-time Architecture**: WebSocket-based live data streaming
- **Multi-platform Support**: Node.js and browser instrumentation
- **VSCode Integration**: Deep integration with editor features
- **Performance Optimized**: Minimal impact on application performance
- **Extensible Design**: Modular architecture for future enhancements

## 📝 Documentation

- **Setup Guide**: Complete installation and configuration instructions
- **API Documentation**: Detailed API reference for instrumentation
- **Examples**: Working examples for different use cases
- **Contributing Guide**: Guidelines for contributors
- **Troubleshooting**: Common issues and solutions

---

**APIViz represents a significant advancement in developer tooling, providing real-time API performance monitoring directly within the development environment. It combines powerful instrumentation, beautiful visualizations, and seamless VSCode integration to create an essential tool for modern web development.**
