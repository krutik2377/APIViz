# APIViz Extension - Verification Steps

## ✅ Extension Installation Confirmed

The extension `apiviz.apiviz` is installed in VS Code.

## 🔄 **IMPORTANT: You MUST Reload VS Code**

The extension is installed but NOT activated yet. Follow these steps:

### **Step 1: Reload VS Code Window**
1. In VS Code, press `Ctrl+Shift+P`
2. Type: `Developer: Reload Window`
3. Press Enter
4. Wait for VS Code to reload

### **Step 2: Look for Activation Messages**
After reload, you should see TWO notifications:
- ✅ "APIViz extension activated successfully!"
- ✅ "APIViz extension loaded! All commands registered."

### **Step 3: Test Commands**
- Press `Ctrl+Shift+P`
- Type: "APIViz"
- You should see all 8 APIViz commands
- Click on "APIViz: Start API Monitoring"
- Should show: "APIViz monitoring started!"

## 🚨 **Troubleshooting:**

### If No Notifications Appear:

1. **Check Extension is Enabled:**
   - Press `Ctrl+Shift+X` (Extensions view)
   - Search for "APIViz"
   - Make sure it shows "Enabled" (not "Disabled")
   - If disabled, click "Enable"

2. **Check Output Panel:**
   - Go to `View` → `Output`
   - In dropdown, select "Extension Host"
   - Look for any APIViz errors

3. **Check Developer Console:**
   - Press `F12` or `Ctrl+Shift+I`
   - Look in Console tab for errors
   - Search for "apiviz" or "APIViz"

4. **Force Complete Restart:**
   - Close ALL VS Code windows
   - Wait 5 seconds
   - Open VS Code again
   - Wait for activation messages

### If Commands Don't Appear:

1. **Verify Extension Status:**
   ```
   Open terminal and run:
   code --list-extensions | findstr apiviz
   
   Should show: apiviz.apiviz
   ```

2. **Check Activation Event:**
   - The extension uses `"onStartupFinished"` activation
   - It should activate automatically when VS Code starts
   - If not, there may be an error in the extension code

3. **Check Extension Output:**
   - View → Output → Select "APIViz" from dropdown
   - Look for any error messages

## 📊 **Expected Results:**

✅ Extension installed: `apiviz.apiviz`
✅ Extension enabled in Extensions view
✅ Activation messages appear on startup
✅ 8 commands available in Command Palette
✅ Commands execute successfully

## 🎯 **Commands to Test:**

1. `APIViz: Start API Monitoring` → Shows "APIViz monitoring started!"
2. `APIViz: Stop API Monitoring` → Shows "APIViz monitoring stopped!"
3. `APIViz: Clear Data` → Shows "APIViz data cleared!"
4. `APIViz: Open Settings` → Opens VS Code settings to apiviz section
5. `APIViz: Open AI Insights` → Shows "AI Insights feature coming soon!"
6. `APIViz: Open Advanced Viz` → Shows "Advanced Visualizations feature coming soon!"
7. `APIViz: Open Social Sharing` → Shows "Social Sharing feature coming soon!"
8. `APIViz: Open Predictive Analytics` → Shows "Predictive Analytics feature coming soon!"

## 🔧 **If Still Not Working:**

Run these commands to reinstall:

```bash
# Uninstall
code --uninstall-extension apiviz.apiviz

# Reinstall
code --install-extension apiviz-0.1.0.vsix --force
```

Then **reload VS Code window** (`Ctrl+Shift+P` → "Developer: Reload Window")

---

**The extension IS installed. You just need to RELOAD VS Code to activate it!**
