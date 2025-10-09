// Example: Node.js Express application with APIViz instrumentation

const express = require('express');
const { instrumentHttp, createExpressMiddleware } = require('../node');

const app = express();
const PORT = 3000;

// Method 1: Auto-instrument all HTTP calls
instrumentHttp({
    agentUrl: 'http://localhost:3001',
    samplingRate: 1.0,
    minLatencyThreshold: 10,
    endpointFilters: ['/api/*'],
    enableLogging: true
});

// Method 2: Express middleware (alternative approach)
// app.use(createExpressMiddleware({
//     agentUrl: 'http://localhost:3001',
//     samplingRate: 1.0,
//     minLatencyThreshold: 10,
//     endpointFilters: ['/api/*'],
//     enableLogging: true
// }));

// Middleware
app.use(express.json());

// Routes
app.get('/api/users', (req, res) => {
    // Simulate some processing time
    setTimeout(() => {
        res.json([
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ]);
    }, Math.random() * 200 + 50); // 50-250ms delay
});

app.get('/api/users/:id', (req, res) => {
    setTimeout(() => {
        res.json({
            id: parseInt(req.params.id),
            name: 'User ' + req.params.id,
            email: `user${req.params.id}@example.com`
        });
    }, Math.random() * 100 + 25); // 25-125ms delay
});

app.post('/api/users', (req, res) => {
    setTimeout(() => {
        res.status(201).json({
            id: Math.floor(Math.random() * 1000),
            ...req.body,
            createdAt: new Date().toISOString()
        });
    }, Math.random() * 300 + 100); // 100-400ms delay
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error route for testing error handling
app.get('/api/error', (req, res) => {
    setTimeout(() => {
        res.status(500).json({ error: 'Internal server error' });
    }, Math.random() * 200 + 100);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Example server running on http://localhost:${PORT}`);
    console.log('📊 APIViz instrumentation enabled');
    console.log('🔗 Try these endpoints:');
    console.log('  - GET /api/users');
    console.log('  - GET /api/users/1');
    console.log('  - POST /api/users');
    console.log('  - GET /api/health');
    console.log('  - GET /api/error');
});

// Simulate some external API calls
setInterval(() => {
    const https = require('https');

    // Make a call to an external API
    const req = https.request('https://jsonplaceholder.typicode.com/posts/1', (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('External API call completed');
        });
    });

    req.on('error', (error) => {
        console.error('External API call failed:', error.message);
    });

    req.end();
}, 10000); // Every 10 seconds
