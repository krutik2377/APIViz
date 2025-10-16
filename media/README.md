# Media Directory

This directory contains static assets for the APIViz extension.

## Chart.js Bundle

The `chart.umd.js` file is currently a placeholder. To use the actual Chart.js library:

1. Download the Chart.js UMD bundle from: https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.js
2. Replace the placeholder `chart.umd.js` file with the downloaded bundle
3. The extension will automatically use the local bundle instead of the CDN

## Security

The extension uses Content Security Policy (CSP) with nonces to ensure secure script execution. The Chart.js bundle is loaded locally to comply with VS Code webview security requirements.
