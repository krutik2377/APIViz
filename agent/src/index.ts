import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { AgentService } from './services/AgentService';
import { WebSocketManager } from './services/WebSocketManager';
import { MetricsCollector } from './services/MetricsCollector';
import { ConfigManager } from './services/ConfigManager';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize services
const configManager = new ConfigManager();
const metricsCollector = new MetricsCollector();
const webSocketManager = new WebSocketManager(wss, metricsCollector);
const agentService = new AgentService(metricsCollector, webSocketManager);

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
    } catch (error) {
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
    } catch (error) {
        console.error('Error updating endpoint stats:', error);
        res.status(500).json({ error: 'Failed to update endpoint stats' });
    }
});

// Clear data endpoint
app.delete('/api/data', (req, res) => {
    try {
        metricsCollector.clearData();
        res.json({ success: true });
    } catch (error) {
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
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
