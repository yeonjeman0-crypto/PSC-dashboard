# PSC Dashboard - Fleet Management System

## 🚀 Quick Start Guide

### Option 1: Run with Local Server (Recommended)
1. Double-click `start-server.bat`
2. Open browser and navigate to: `http://localhost:8000`

### Option 2: Direct File Access
Open `integrated-dashboard.html` directly in your browser

## 📁 File Structure

```
psc-dashboard/
├── index.html                  # Main entry point (redirects to dashboard)
├── integrated-dashboard.html   # Standalone version with embedded data
├── start-server.bat           # Server startup script
├── src/
│   ├── pages/
│   │   ├── dashboard.html    # Main dashboard page
│   │   ├── inspections.html  # Inspection management
│   │   ├── deficiencies.html # Non-conformity analysis
│   │   ├── vessels.html      # Vessel management
│   │   ├── ports-map.html    # Port visualization
│   │   ├── risk.html         # Risk assessment
│   │   └── reports.html      # Report generation
│   ├── assets/
│   │   ├── js/               # JavaScript modules
│   │   ├── css/              # Custom styles
│   │   └── data/             # Static data files
│   └── components/           # Reusable components
└── processed_data/           # ETL processed data
```

## ⚠️ Known Issues & Solutions

### Issue: Dashboard not loading properly

**Cause**: Browser security blocks local file access (CORS policy)

**Solutions**:

1. **Use Local Web Server** (Recommended)
   - Run `start-server.bat`
   - Access via `http://localhost:8000`

2. **Use Integrated Version**
   - Open `integrated-dashboard.html` directly
   - This version has embedded data

3. **Chrome with Disabled Security** (Development only)
   ```bash
   chrome.exe --disable-web-security --user-data-dir="C:/temp"
   ```

### Issue: Data not updating

**Cause**: Static data or missing data files

**Solution**: Ensure `processed_data` folder contains:
- `/operational/inspection_records.json`
- `/operational/deficiency_records.json`
- `/core_master/vessel_master.json`

## 🔧 Technical Requirements

- Modern web browser (Chrome, Firefox, Edge)
- Python 3.x or Node.js (for local server)
- Internet connection (for CDN resources)

## 📊 Dashboard Features

### KPI Cards
- Total Vessels: 14 (7 PC(T)C, 7 Bulk)
- Total Inspections: 30
- Total Non-conformities: 87
- Detention Rate: 13.3%

### Analytics
- Monthly inspection trends
- Top 10 non-conformity codes
- Fleet composition visualization
- MOU performance heat map
- Vessel risk assessment

### Management Functions
- Inspection tracking
- Non-conformity analysis
- Vessel performance monitoring
- Port State Control readiness
- Compliance reporting

## 🛠️ Troubleshooting Steps

1. **Check Console for Errors**
   - Open browser DevTools (F12)
   - Check Console tab for red errors
   - Common errors: CORS, file not found, syntax errors

2. **Verify File Paths**
   - Ensure all files are in correct folders
   - Check relative paths in HTML/JS files
   - Verify data files exist

3. **Test with Server**
   - Always use local server for development
   - Avoid `file://` protocol issues
   - Use `http://localhost:8000`

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R
   - Clear site data in DevTools
   - Try incognito/private mode

## 📞 Support

For maritime-specific implementation:
- Review ISM procedures (PR13-01)
- Check PSC inspection guidelines
- Verify Tokyo MOU CIC requirements

## 🔄 Updates

Last updated: 2025-08-26
- Fixed file path issues
- Added standalone version
- Created server startup script
- Updated troubleshooting guide