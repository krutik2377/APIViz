# APIViz - Real-time API Latency Monitor

<img width="1918" height="1043" alt="image" src="https://github.com/user-attachments/assets/232ae5f8-5ccf-4626-bc3e-0adfb80125ab" />
<img width="1915" height="1078" alt="image" src="https://github.com/user-attachments/assets/97a59a56-45e7-4b4a-b712-b578aab2a499" />
<img width="1913" height="1079" alt="image" src="https://github.com/user-attachments/assets/ac1d8589-62c4-4b90-8c62-c0f41153d2f5" />
<img width="1919" height="1075" alt="image" src="https://github.com/user-attachments/assets/91e4ba6a-72f9-4b0b-be1a-1a862fcf0310" />
<img width="1919" height="1074" alt="image" src="https://github.com/user-attachments/assets/628c654b-b4c7-4497-8a6a-9fb02c8dcab0" />



🚀 **Visualize API call latency in real-time directly in your VSCode editor**

APIViz is a powerful VSCode extension that provides real-time monitoring and visualization of API call performance. It hooks into your running applications to capture HTTP request latency and displays it through beautiful charts, inline decorations, and status indicators.

## ✨ Features

- 🔴 **Real-time Monitoring**: Live latency tracking for all HTTP requests
- 📊 **Beautiful Visualizations**: Interactive charts and graphs in the sidebar
- 🎯 **Inline Decorations**: See latency directly next to your API calls in the editor
- 📈 **Performance Metrics**: Average, 95th percentile, and max latency tracking
- 🔧 **Configurable**: Customizable sampling rates, filters, and thresholds
- 🌐 **Multi-Platform**: Works with Node.js, browser, and various HTTP clients
- ⚡ **Lightweight**: Minimal performance impact on your applications

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    HTTP/WS    ┌─────────────────┐
│   Your App      │◄──────────────►│  APIViz Agent   │◄─────────────►│  VSCode Ext     │
│  (Instrumented) │                 │  (Local Server) │                │  (Visualization)│
└─────────────────┘                 └─────────────────┘                └─────────────────┘
```

## 🚀 Quick Start

### 1. Install the Extension

Install APIViz from the VSCode marketplace or build from source.

### 2. Start the Agent

The extension will automatically start a local agent server on port 3001.

### 3. Instrument Your Code

Add the APIViz instrumentation to your application:

```javascript
// For Node.js applications
const { instrumentHttp } = require('apiviz-agent');
instrumentHttp();

// For browser applications
import { instrumentFetch } from 'apiviz-agent/browser';
instrumentFetch();
```

### 4. Start Monitoring

Click the "Start API Monitoring" button in the APIViz sidebar or use the command palette.

## 📁 Project Structure

```
apiviz/
├── src/                    # VSCode extension source code
│   ├── extension.ts       # Main extension entry point
│   ├── providers/         # Data providers and tree views
│   ├── views/            # UI components and webviews
│   ├── services/         # Core services (WebSocket, data processing)
│   └── types/            # TypeScript type definitions
├── agent/                 # Local agent server
│   ├── src/              # Agent source code
│   ├── middleware/       # HTTP instrumentation middleware
│   └── package.json      # Agent dependencies
├── instrumentation/       # Client-side instrumentation
│   ├── node/             # Node.js instrumentation
│   ├── browser/          # Browser instrumentation
│   └── examples/         # Example implementations
└── docs/                 # Documentation and guides
```

## 🛠️ Development

### Prerequisites

- Node.js 16+
- VSCode 1.74+
- TypeScript 4.9+

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd apiviz

# Install dependencies
npm install

# Build the extension
npm run compile

# Start development mode
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Package extension
npm run package
```

## 📊 UI Components

### Sidebar Views

- **Live Latency**: Real-time latency data for active endpoints
- **Endpoints**: List of all monitored endpoints with statistics
- **Performance Charts**: Historical performance graphs

### Inline Decorations

Latency information appears directly next to API calls in your code:

```javascript
fetch('/api/users') // ← 120ms
  .then(response => response.json());
```

### Status Bar

Real-time average latency display in the VSCode status bar.

## ⚙️ Configuration

Configure APIViz through VSCode settings:

```json
{
  "apiviz.agentPort": 3001,
  "apiviz.samplingRate": 1.0,
  "apiviz.minLatencyThreshold": 10,
  "apiviz.showInlineDecorations": true,
  "apiviz.endpointFilters": ["/api/*"]
}
```

## 🔌 Supported Technologies

- **HTTP Clients**: fetch, axios, XMLHttpRequest, node-fetch
- **Frameworks**: Express, Fastify, Next.js, React, Vue
- **Languages**: JavaScript, TypeScript, Node.js
- **Protocols**: HTTP, HTTPS, WebSocket

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] GraphQL support
- [ ] Database query monitoring
- [ ] Performance alerts
- [ ] Export capabilities
- [ ] Team collaboration features
- [ ] Integration with popular monitoring tools

---

**Built with ❤️ for developers who care about performance**
