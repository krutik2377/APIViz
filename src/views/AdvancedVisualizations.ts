import * as vscode from 'vscode';
import { DataProcessor } from '../services/DataProcessor';
import { ApiCall, EndpointStats, LatencyDataPoint } from '../types';

/**
 * Advanced Visualizations Webview
 * 
 * Required static files in media/ directory:
 * - three.min.js (Three.js library)
 * - chart.min.js (Chart.js library)
 * 
 * Download from:
 * - Three.js: https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.min.js
 * - Chart.js: https://cdn.jsdelivr.net/npm/chart.js/dist/chart.min.js
 */

export class AdvancedVisualizations {
    private panel: vscode.WebviewPanel | undefined;
    private dataProcessor: DataProcessor;

    constructor(dataProcessor: DataProcessor) {
        this.dataProcessor = dataProcessor;
    }

    public createWebview(context: vscode.ExtensionContext): vscode.WebviewPanel {
        this.panel = vscode.window.createWebviewPanel(
            'apivizAdvancedViz',
            'Advanced Performance Visualizations',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent(context);

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'requestData':
                        this.sendDataToWebview();
                        break;
                    case 'changeVisualization':
                        this.changeVisualization(message.type);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        // Send initial data
        this.sendDataToWebview();

        // Set up data refresh
        const refreshInterval = setInterval(() => {
            if (this.panel && this.panel.visible) {
                this.sendDataToWebview();
            }
        }, 3000);

        this.panel.onDidDispose(() => {
            clearInterval(refreshInterval);
            // Send dispose message to webview to stop animation loop
            this.panel?.webview.postMessage({ type: 'dispose' });
        });

        return this.panel;
    }

    private sendDataToWebview(): void {
        if (!this.panel) {
            return;
        }

        const metrics = this.dataProcessor.getPerformanceMetrics();
        const latencyData = this.dataProcessor.getLatencyDataPoints();
        const endpointStats = this.dataProcessor.getEndpointStats();
        const recentCalls = this.dataProcessor.getRecentCalls(100);

        this.panel.webview.postMessage({
            type: 'data',
            data: {
                metrics,
                latencyData,
                endpointStats,
                recentCalls
            }
        });
    }

    private changeVisualization(type: string): void {
        if (this.panel) {
            this.panel.webview.postMessage({
                type: 'changeViz',
                data: { visualizationType: type }
            });
        }
    }

    private getWebviewContent(context: vscode.ExtensionContext): string {
        // Generate a nonce for security
        const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Create webview URIs for local static files
        const webview = this.panel!.webview;
        const threeJsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'media', 'three.min.js')
        );
        const chartJsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'media', 'chart.min.js')
        );
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'none'; 
                   script-src 'nonce-${nonce}'; 
                   style-src 'self' 'unsafe-inline';">
    <title>Advanced Performance Visualizations</title>
    <script nonce="${nonce}" src="${threeJsUri}"></script>
    <script nonce="${nonce}" src="${chartJsUri}"></script>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .visualization-selector {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .viz-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .viz-btn:hover, .viz-btn.active {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.6);
            transform: translateY(-2px);
        }
        
        .visualization-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            min-height: 600px;
        }
        
        #threejs-container {
            width: 100%;
            height: 500px;
            border-radius: 15px;
            overflow: hidden;
            background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
        }
        
        .heatmap-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .heatmap-cell {
            background: #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .heatmap-cell:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .heatmap-cell.fast {
            background: linear-gradient(135deg, #4CAF50, #8BC34A);
            color: white;
        }
        
        .heatmap-cell.moderate {
            background: linear-gradient(135deg, #FF9800, #FFC107);
            color: white;
        }
        
        .heatmap-cell.slow {
            background: linear-gradient(135deg, #F44336, #E91E63);
            color: white;
        }
        
        .particle-container {
            position: relative;
            width: 100%;
            height: 500px;
            background: linear-gradient(45deg, #1a1a2e, #16213e);
            border-radius: 15px;
            overflow: hidden;
        }
        
        .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .galaxy-container {
            position: relative;
            width: 100%;
            height: 500px;
            background: radial-gradient(circle, #1a1a2e 0%, #0f0f1e 100%);
            border-radius: 15px;
            overflow: hidden;
        }
        
        .star {
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            animation: twinkle 2s ease-in-out infinite;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
        }
        
        .ocean-container {
            position: relative;
            width: 100%;
            height: 500px;
            background: linear-gradient(180deg, #87CEEB 0%, #4682B4 50%, #191970 100%);
            border-radius: 15px;
            overflow: hidden;
        }
        
        .fish {
            position: absolute;
            font-size: 20px;
            animation: swim 4s linear infinite;
        }
        
        @keyframes swim {
            0% { transform: translateX(-50px) rotateY(0deg); }
            50% { transform: translateX(calc(100vw - 50px)) rotateY(0deg); }
            51% { transform: translateX(calc(100vw - 50px)) rotateY(180deg); }
            100% { transform: translateX(-50px) rotateY(180deg); }
        }
        
        .city-container {
            position: relative;
            width: 100%;
            height: 500px;
            background: linear-gradient(180deg, #87CEEB 0%, #4682B4 100%);
            border-radius: 15px;
            overflow: hidden;
        }
        
        .building {
            position: absolute;
            bottom: 0;
            background: linear-gradient(180deg, #2c3e50, #34495e);
            border-radius: 5px 5px 0 0;
        }
        
        .traffic-light {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: traffic 3s ease-in-out infinite;
        }
        
        @keyframes traffic {
            0%, 33% { background: #4CAF50; }
            34%, 66% { background: #FF9800; }
            67%, 100% { background: #F44336; }
        }
        
        .no-data {
            text-align: center;
            padding: 50px;
            color: white;
        }
        
        .no-data h2 {
            font-size: 2em;
            margin-bottom: 20px;
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .stats-overlay {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Advanced Performance Visualizations</h1>
            <p>Experience your API performance through stunning 3D and interactive visualizations</p>
        </div>
        
        <div class="visualization-selector">
            <button class="viz-btn active" onclick="changeVisualization('3d', this, { fromExtension: false })">🌌 3D Performance Galaxy</button>
            <button class="viz-btn" onclick="changeVisualization('heatmap', this, { fromExtension: false })">🔥 Performance Heatmap</button>
            <button class="viz-btn" onclick="changeVisualization('particles', this, { fromExtension: false })">✨ Particle System</button>
            <button class="viz-btn" onclick="changeVisualization('ocean', this, { fromExtension: false })">🐠 Performance Ocean</button>
            <button class="viz-btn" onclick="changeVisualization('city', this, { fromExtension: false })">🏙️ Performance City</button>
        </div>
        
        <div class="visualization-container">
            <div id="visualization-content">
                <div class="no-data">
                    <h2>🚀 Ready for Advanced Visualizations</h2>
                    <p>Start monitoring your APIs to see stunning performance visualizations!</p>
                </div>
            </div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        let currentVisualization = '3d';
        let scene, camera, renderer;
        let animationId;
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'data':
                    updateVisualization(message.data);
                    break;
                case 'changeViz':
                    changeVisualization(message.data.visualizationType, null, { fromExtension: true });
                    break;
                case 'dispose':
                    // Stop animation loop and cleanup
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                    break;
            }
        });
        
        function changeVisualization(type, btn, { fromExtension = false } = {}) {
            currentVisualization = type;
            
            // Cancel any previous animation loop
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            // Update button states (only if button is provided)
            document.querySelectorAll('.viz-btn').forEach(button => button.classList.remove('active'));
            if (btn) {
                btn.classList.add('active');
            }
            
            // Clear current visualization
            const content = document.getElementById('visualization-content');
            content.innerHTML = '';
            
            // Create new visualization
            switch (type) {
                case '3d':
                    create3DVisualization();
                    break;
                case 'heatmap':
                    createHeatmapVisualization();
                    break;
                case 'particles':
                    createParticleVisualization();
                    break;
                case 'ocean':
                    createOceanVisualization();
                    break;
                case 'city':
                    createCityVisualization();
                    break;
            }
            
            // Only post message if not called from extension (avoid ping-pong loop)
            if (!fromExtension) {
                vscode.postMessage({ command: 'changeVisualization', type: type });
            }
        }
        
        function create3DVisualization() {
            const container = document.getElementById('visualization-content');
            container.innerHTML = '<div id="threejs-container"></div>';
            
            // Initialize Three.js
            const threeContainer = document.getElementById('threejs-container');
            
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
            renderer.setClearColor(0x000000, 0);
            threeContainer.appendChild(renderer.domElement);
            
            // Create performance galaxy
            createPerformanceGalaxy();
            
            // Start animation
            animate();
        }
        
        function createPerformanceGalaxy() {
            // Create stars (API calls)
            const starGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            
            for (let i = 0; i < 200; i++) {
                const star = new THREE.Mesh(starGeometry, starMaterial);
                star.position.x = (Math.random() - 0.5) * 20;
                star.position.y = (Math.random() - 0.5) * 20;
                star.position.z = (Math.random() - 0.5) * 20;
                scene.add(star);
            }
            
            // Create performance planets (endpoints)
            const planetGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const planetMaterials = [
                new THREE.MeshBasicMaterial({ color: 0x4CAF50 }), // Fast
                new THREE.MeshBasicMaterial({ color: 0xFF9800 }), // Moderate
                new THREE.MeshBasicMaterial({ color: 0xF44336 })  // Slow
            ];
            
            for (let i = 0; i < 10; i++) {
                const planet = new THREE.Mesh(planetGeometry, planetMaterials[i % 3]);
                planet.position.x = Math.cos(i * 0.6) * 8;
                planet.position.z = Math.sin(i * 0.6) * 8;
                planet.position.y = (Math.random() - 0.5) * 4;
                scene.add(planet);
            }
            
            camera.position.z = 15;
        }
        
        function animate() {
            animationId = requestAnimationFrame(animate);
            
            // Rotate the scene
            scene.rotation.y += 0.005;
            scene.rotation.x += 0.002;
            
            renderer.render(scene, camera);
        }
        
        function createHeatmapVisualization() {
            const container = document.getElementById('visualization-content');
            container.innerHTML = \`
                <h2>🔥 Performance Heatmap</h2>
                <div class="heatmap-container" id="heatmap-grid"></div>
            \`;
            
            // This will be populated with real data
            const grid = document.getElementById('heatmap-grid');
            for (let i = 0; i < 20; i++) {
                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                cell.innerHTML = \`
                    <div style="font-weight: bold;">Endpoint \${i + 1}</div>
                    <div style="font-size: 0.8em; margin-top: 5px;">\${Math.floor(Math.random() * 500)}ms</div>
                \`;
                
                // Random performance level
                const performance = Math.random();
                if (performance > 0.7) {
                    cell.classList.add('fast');
                } else if (performance > 0.4) {
                    cell.classList.add('moderate');
                } else {
                    cell.classList.add('slow');
                }
                
                grid.appendChild(cell);
            }
        }
        
        function createParticleVisualization() {
            const container = document.getElementById('visualization-content');
            container.innerHTML = \`
                <h2>✨ Performance Particle System</h2>
                <div class="particle-container" id="particle-container"></div>
            \`;
            
            const particleContainer = document.getElementById('particle-container');
            
            // Create floating particles
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.width = Math.random() * 10 + 5 + 'px';
                particle.style.height = particle.style.width;
                particle.style.background = \`hsl(\${Math.random() * 60 + 200}, 70%, 60%)\`;
                particle.style.animationDelay = Math.random() * 3 + 's';
                particleContainer.appendChild(particle);
            }
        }
        
        function createOceanVisualization() {
            const container = document.getElementById('visualization-content');
            container.innerHTML = \`
                <h2>🐠 Performance Ocean</h2>
                <div class="ocean-container" id="ocean-container"></div>
            \`;
            
            const oceanContainer = document.getElementById('ocean-container');
            
            // Create swimming fish (API calls)
            for (let i = 0; i < 15; i++) {
                const fish = document.createElement('div');
                fish.className = 'fish';
                fish.textContent = '🐠';
                fish.style.top = Math.random() * 80 + 10 + '%';
                fish.style.animationDelay = Math.random() * 4 + 's';
                fish.style.animationDuration = (Math.random() * 3 + 2) + 's';
                oceanContainer.appendChild(fish);
            }
        }
        
        function createCityVisualization() {
            const container = document.getElementById('visualization-content');
            container.innerHTML = \`
                <h2>🏙️ Performance City</h2>
                <div class="city-container" id="city-container"></div>
            \`;
            
            const cityContainer = document.getElementById('city-container');
            
            // Create buildings (endpoints)
            for (let i = 0; i < 20; i++) {
                const building = document.createElement('div');
                building.className = 'building';
                building.style.left = i * 5 + '%';
                building.style.width = '4%';
                building.style.height = Math.random() * 200 + 100 + 'px';
                cityContainer.appendChild(building);
                
                // Add traffic lights
                const light = document.createElement('div');
                light.className = 'traffic-light';
                light.style.left = (i * 5 + 2) + '%';
                light.style.top = '20px';
                light.style.animationDelay = Math.random() * 3 + 's';
                cityContainer.appendChild(light);
            }
        }
        
        function updateVisualization(data) {
            if (data.metrics.totalCalls === 0) {
                document.getElementById('visualization-content').innerHTML = \`
                    <div class="no-data">
                        <h2>🚀 Ready for Advanced Visualizations</h2>
                        <p>Start monitoring your APIs to see stunning performance visualizations!</p>
                    </div>
                \`;
                return;
            }
            
            // Update current visualization with real data
            switch (currentVisualization) {
                case '3d':
                    update3DVisualization(data);
                    break;
                case 'heatmap':
                    updateHeatmapVisualization(data);
                    break;
                case 'particles':
                    updateParticleVisualization(data);
                    break;
                case 'ocean':
                    updateOceanVisualization(data);
                    break;
                case 'city':
                    updateCityVisualization(data);
                    break;
            }
        }
        
        function update3DVisualization(data) {
            // Update 3D scene with real performance data
            if (scene) {
                // Update star colors based on latency
                scene.children.forEach((child, index) => {
                    if (child.geometry && child.geometry.type === 'SphereGeometry') {
                        if (index < data.recentCalls.length) {
                            const call = data.recentCalls[index];
                            if (call.latency < 100) {
                                child.material.color.setHex(0x4CAF50); // Green
                            } else if (call.latency < 500) {
                                child.material.color.setHex(0xFF9800); // Orange
                            } else {
                                child.material.color.setHex(0xF44336); // Red
                            }
                        }
                    }
                });
            }
        }
        
        function updateHeatmapVisualization(data) {
            const grid = document.getElementById('heatmap-grid');
            if (grid) {
                grid.innerHTML = '';
                data.endpointStats.forEach((endpoint, index) => {
                    const cell = document.createElement('div');
                    cell.className = 'heatmap-cell';
                    cell.innerHTML = \`
                        <div style="font-weight: bold;">\${endpoint.endpoint.substring(0, 15)}...</div>
                        <div style="font-size: 0.8em; margin-top: 5px;">\${Math.round(endpoint.averageLatency)}ms</div>
                        <div style="font-size: 0.7em; margin-top: 2px;">\${endpoint.totalCalls} calls</div>
                    \`;
                    
                    if (endpoint.averageLatency < 100) {
                        cell.classList.add('fast');
                    } else if (endpoint.averageLatency < 500) {
                        cell.classList.add('moderate');
                    } else {
                        cell.classList.add('slow');
                    }
                    
                    grid.appendChild(cell);
                });
            }
        }
        
        function updateParticleVisualization(data) {
            // Update particle colors based on performance
            const particles = document.querySelectorAll('.particle');
            particles.forEach((particle, index) => {
                if (index < data.recentCalls.length) {
                    const call = data.recentCalls[index];
                    if (call.latency < 100) {
                        particle.style.background = '#4CAF50';
                    } else if (call.latency < 500) {
                        particle.style.background = '#FF9800';
                    } else {
                        particle.style.background = '#F44336';
                    }
                }
            });
        }
        
        function updateOceanVisualization(data) {
            // Update fish speed based on performance
            const fish = document.querySelectorAll('.fish');
            fish.forEach((fishElement, index) => {
                if (index < data.recentCalls.length) {
                    const call = data.recentCalls[index];
                    const speed = Math.max(1, 5 - (call.latency / 200));
                    fishElement.style.animationDuration = speed + 's';
                }
            });
        }
        
        function updateCityVisualization(data) {
            // Update building heights based on performance
            const buildings = document.querySelectorAll('.building');
            buildings.forEach((building, index) => {
                if (index < data.endpointStats.length) {
                    const endpoint = data.endpointStats[index];
                    const height = Math.max(50, 300 - endpoint.averageLatency);
                    building.style.height = height + 'px';
                }
            });
        }
        
        // Initialize with 3D visualization
        create3DVisualization();
        
        // Request initial data
        vscode.postMessage({ command: 'requestData' });
    </script>
</body>
</html>`;
    }
}
