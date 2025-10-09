# Changelog

All notable changes to APIViz will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of APIViz
- Real-time API latency monitoring
- VSCode extension with sidebar views
- Local agent server for data collection
- HTTP instrumentation for Node.js and browser
- Inline latency decorations in code editor
- Performance charts and visualizations
- Status bar integration
- Export/import functionality
- Configuration management
- WebSocket communication between agent and extension

### Features
- **Real-time Monitoring**: Live tracking of API call latency
- **Multiple Views**: Sidebar tree views for latency and endpoint data
- **Inline Decorations**: Latency displayed next to API calls in editor
- **Performance Charts**: Interactive charts with Chart.js
- **Status Bar**: Real-time average latency display
- **Data Export**: JSON export/import of performance data
- **Configurable**: Sampling rates, filters, and thresholds
- **Multi-platform**: Node.js and browser instrumentation

### Technical Details
- TypeScript implementation
- VSCode Extension API integration
- WebSocket-based real-time communication
- Express.js agent server
- HTTP client instrumentation (fetch, XMLHttpRequest, axios)
- Tree view providers for data display
- Webview panels for detailed visualizations

## [0.1.0] - 2024-01-XX

### Added
- Initial project structure
- Core extension functionality
- Agent server implementation
- Basic instrumentation
- Documentation and examples

---

## Version History

- **0.1.0**: Initial release with core functionality
- **Unreleased**: Future features and improvements

## Roadmap

### Planned Features
- GraphQL support
- Database query monitoring
- Performance alerts and notifications
- Team collaboration features
- Enhanced visualization options
- Plugin system
- Integration with popular monitoring tools

### Known Issues
- None at this time

### Breaking Changes
- None at this time
