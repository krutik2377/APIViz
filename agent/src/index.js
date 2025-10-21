"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const AgentService_1 = require("./services/AgentService");
const WebSocketManager_1 = require("./services/WebSocketManager");
const MetricsCollector_1 = require("./services/MetricsCollector");
const ConfigManager_1 = require("./services/ConfigManager");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
// Initialize services
const configManager = new ConfigManager_1.ConfigManager();
const metricsCollector = new MetricsCollector_1.MetricsCollector();
const webSocketManager = new WebSocketManager_1.WebSocketManager(wss, metricsCollector);
const agentService = new AgentService_1.AgentService(metricsCollector, webSocketManager);
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime(),
        version: '0.1.0'
    });
});
// Metrics endpoint
app.get('/metrics', (req, res) => {
    const metrics = metricsCollector.getMetrics();
    res.json(metrics);
});
// API call endpoint for receiving metrics
app.post('/api/calls', (req, res) => {
    try {
        const apiCall = req.body;
        agentService.processApiCall(apiCall);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error processing API call:', error);
        res.status(500).json({ error: 'Failed to process API call' });
    }
});
// Endpoint stats endpoint
app.post('/api/stats', (req, res) => {
    try {
        const stats = req.body;
        agentService.updateEndpointStats(stats);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating endpoint stats:', error);
        res.status(500).json({ error: 'Failed to update endpoint stats' });
    }
});
// Clear data endpoint
app.delete('/api/data', (req, res) => {
    try {
        metricsCollector.clearData();
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error clearing data:', error);
        res.status(500).json({ error: 'Failed to clear data' });
    }
});
// Configuration endpoint
app.get('/api/config', (req, res) => {
    res.json(configManager.getConfig());
});
app.put('/api/config', (req, res) => {
    try {
        configManager.updateConfig(req.body);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});
// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Start server
const PORT = process.env.PORT || configManager.getConfig().port || 3001;
server.listen(PORT, () => {
    console.log(`🚀 APIViz Agent running on port ${PORT}`);
    console.log(`📊 WebSocket server ready for connections`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
});
// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down APIViz Agent...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down APIViz Agent...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
//# sourceMappingURL=index.js.map