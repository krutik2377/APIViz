# APIViz Extension - Full Version Guide

## 🎉 Full Version Installed Successfully!

You now have the **complete APIViz extension** with all features enabled.

## 🔄 **IMPORTANT: Reload VS Code Now**

1. **Press `Ctrl+Shift+P`**
2. **Type**: `Developer: Reload Window`
3. **Press Enter**

After reload, you'll see all the new features!

## 🎯 **What's New in Full Version:**

### **1. Activity Bar Icon (Left Sidebar)**
Look for the **📊 APIViz icon** in the left Activity Bar (next to Explorer, Search, etc.)

Click it to see:
- **Live Latency** - Real-time API performance
- **Endpoints** - List of monitored endpoints
- **AI Insights** - Performance recommendations
- **Team Leaderboard** - Team performance metrics

### **2. Bottom Panel**
Look for the **Performance Charts** tab in the bottom panel

### **3. Status Bar**
Monitor status indicator appears in the bottom status bar

### **4. Inline Decorations**
Latency information appears next to API calls in your code

## 🚀 **How to Use the Full Version:**

### **Step 1: Start Monitoring**

**Option A: Via Command Palette**
1. Press `Ctrl+Shift+P`
2. Type: `APIViz: Start API Monitoring`
3. Press Enter

**Option B: Via Activity Bar**
1. Click the APIViz icon in the Activity Bar
2. Click the "Start Monitoring" button

### **Step 2: View Live Data**

Once monitoring starts, you'll see:

#### **Live Latency View:**
```
📊 Live Latency
  ├── GET /api/users - 45ms ✅
  ├── POST /api/data - 120ms ⚠️
  └── GET /api/posts - 350ms ❌
```

#### **Endpoints View:**
```
🔌 Endpoints
  ├── /api/users
  │   ├── Average: 50ms
  │   ├── Count: 25
  │   └── Success Rate: 98%
  └── /api/data
      ├── Average: 115ms
      ├── Count: 10
      └── Success Rate: 100%
```

#### **AI Insights View:**
```
🤖 AI Insights
  ├── 💡 Slow endpoint detected: /api/posts
  ├── 💡 Consider caching for /api/users
  └── 💡 High latency during peak hours
```

### **Step 3: Explore Advanced Features**

#### **Open AI Insights Panel:**
- `Ctrl+Shift+P` → `APIViz: Open AI Insights`
- See detailed performance analysis

#### **Open Advanced Visualizations:**
- `Ctrl+Shift+P` → `APIViz: Open Advanced Visualizations`
- View performance charts and graphs

#### **Open Predictive Analytics:**
- `Ctrl+Shift+P` → `APIViz: Open Predictive Analytics`
- See ML-based performance predictions

#### **Open Social Sharing:**
- `Ctrl+Shift+P` → `APIViz: Open Social Sharing`
- Share performance data with team

## 🎨 **What You'll See:**

### **Activity Bar Icon:**
- Click the pulse icon (📊) in the left sidebar
- Opens the APIViz panel with all views

### **Tree Views:**
- Expandable/collapsible tree structure
- Real-time updates as API calls happen
- Color-coded performance indicators:
  - 🟢 Green: Fast (< 100ms)
  - 🟡 Yellow: Medium (100-300ms)
  - 🔴 Red: Slow (> 300ms)

### **Status Bar:**
- Shows "APIViz: Monitoring" when active
- Displays current API call count
- Shows average latency

### **Inline Decorations:**
- Latency info appears next to API calls
- Updates in real-time
- Hover for detailed information

## 📊 **Configure the Extension:**

### **Settings (`Ctrl+,` → Search "APIViz"):**

1. **Auto Start** - Start monitoring automatically
2. **Agent Port** - Port for local agent (default: 3001)
3. **Sampling Rate** - Percentage of calls to monitor (default: 100%)
4. **Min Latency Threshold** - Ignore calls below this (default: 10ms)
5. **Max Data Points** - Memory limit (default: 1000)
6. **Show Inline Decorations** - Enable/disable decorations
7. **Endpoint Filters** - URL patterns to monitor

## 🔧 **Setup for Real Monitoring:**

To see real API monitoring, you need:

### **Option 1: Use with Your Project**

1. **Open your project** (like DFSA-WebFull)
2. **Start monitoring**: `APIViz: Start API Monitoring`
3. **Make API calls** in your application
4. **Watch the data** flow into the extension

### **Option 2: Run the Agent (Advanced)**

For advanced features, run the local agent:

```bash
# In your project directory
npm run agent:dev
```

This starts a WebSocket server that:
- Captures HTTP requests
- Streams data to the extension
- Provides real-time monitoring

## 🎯 **Expected Features:**

### ✅ **Working Now:**
- Extension activation
- Command registration
- Settings configuration
- Activity Bar icon
- Tree view providers
- Webview panels
- Status bar manager

### 🔧 **Requires Agent for Full Functionality:**
- Real-time data streaming
- WebSocket connection
- Live latency updates
- Performance charts

### ℹ️ **What You'll See Without Agent:**
- UI components load
- Tree views appear (empty initially)
- Commands work
- Panels open
- Settings available

## 🚨 **Troubleshooting:**

### **Icon Not Appearing:**
1. Reload VS Code window
2. Check Extensions view - ensure enabled
3. Check for activation errors in Output panel

### **No Data Showing:**
- This is normal without the agent running
- The UI is ready but needs data source
- Configure endpoint filters in settings
- Run agent for live data

### **Commands Not Working:**
1. Check Output panel: View → Output → "APIViz"
2. Check Developer Console: `Ctrl+Shift+I`
3. Look for error messages

## 📈 **Next Steps:**

1. **Reload VS Code** (`Ctrl+Shift+P` → "Developer: Reload Window")
2. **Look for APIViz icon** in Activity Bar
3. **Click the icon** to see the panel
4. **Start monitoring** via command or button
5. **Explore the features**

## 🎓 **Understanding the Extension:**

### **Architecture:**
```
Extension (VS Code)
  ├── Activity Bar Icon
  ├── Tree View Providers
  │   ├── LatencyProvider
  │   ├── EndpointsProvider
  │   ├── AIInsightsProvider
  │   └── TeamLeaderboardProvider
  ├── Webview Panels
  │   ├── AIInsightsWebview
  │   ├── AdvancedVisualizations
  │   ├── PredictiveAnalyticsWebview
  │   └── SocialSharingWebview
  ├── Services
  │   ├── WebSocketService (connects to agent)
  │   ├── DataProcessor (processes metrics)
  │   ├── InlineDecorator (shows latency)
  │   ├── StatusBarManager (status updates)
  │   └── MLPredictiveEngine (AI analysis)
  └── Commands
      ├── Start/Stop Monitoring
      ├── Open Panels
      └── Clear Data
```

## 🌟 **Key Features:**

1. **Real-Time Monitoring** - Live API performance tracking
2. **AI-Powered Insights** - Smart recommendations
3. **Predictive Analytics** - ML-based performance prediction
4. **Team Features** - Leaderboards and collaboration
5. **Visual Analytics** - Charts and graphs
6. **Inline Decorations** - Code-level latency info
7. **Smart Alerting** - Automated performance alerts

## 🎉 **You're Ready!**

The full version is installed. Just **reload VS Code** to see all the features!

---

**Enjoy your complete APIViz extension!** 🚀
