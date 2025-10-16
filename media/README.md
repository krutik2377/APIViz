# Media Directory

This directory contains static assets for the APIViz extension.

## Chart.js Bundle

The `chart.umd.js` file contains the real Chart.js v4.4.0 UMD bundle downloaded from:
https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js

This bundle provides full Chart.js functionality for the PredictiveAnalyticsWebview charts.

## Security

The extension uses Content Security Policy (CSP) with nonces to ensure secure script execution. The Chart.js bundle is loaded locally to comply with VS Code webview security requirements.

## File Details

- **File**: `chart.umd.js`
- **Version**: Chart.js v4.4.0
- **Size**: ~205KB
- **Source**: Official Chart.js CDN
- **License**: MIT License
