# Rum-inspector
<RUM>Inspector — User Documentation
<RUM>Inspector is a specialized browser extension. It allows developers and QA engineers to instantly inspect metadata, automation tags, and link health directly from the UI without opening the heavy standard browser developer tools.

🛠 How to Install
Since this is a custom internal tool, follow these steps to load it into your browser:
1. Prepare the FolderEnsure your project folder contains the following structure:
  - manifest.json
  - content.js
  - background.js
  - icons/ (Folder containing icon16.png, icon48.png, and icon128.png)
2. Enable Developer Mode
  - Open Chrome and navigate to chrome://extensions/.
  - In the top-right corner, toggle the Developer mode switch to ON.
3. Load the Extension
  - Click the Load unpacked button that appears.
  - Select the folder containing the extension files.
  - The <RUM>Inspector icon should now appear in your extensions list.
4. Refresh your Dashboard
  - Navigate to your SolarWinds instance (e.g., platform-swdc.solarwinds.com) and Refresh the page to allow the script to inject.
  
🚀 How it Helps the User
1. Instant Metadata Access
   Instead of digging through the "Elements" tab in Chrome DevTools, simply Right-click any item and select "Inspect with <RUM>Inspector".
     - What it does: It instantly displays the element's ID, Text Content, and specific RUM attributes (data-linktype, data-linkdetail, data-automation-group).
2. Recursive Parent Inspection
   Often, the automation tags are not on the clicked icon but on a parent container.
    - How it helps: The extension automatically "climbs" up to 3 levels of the DOM tree. If the clicked element is missing tags, it finds and displays them from the parent levels automatically.
3. Real-Time Link Analysis (The "Link Health" Check)
   Validating if a link works or where it leads usually requires clicking it (which might navigate you away from your work).
     - The Solution: When you inspect a link, the extension performs a background check to show:
       - HTTP Status: Instantly see if a link is ✅ 200 OK or ❌ 404 Not Found.
       - Redirect Tracking: If a link is a 301 or 302 redirect, it shows you the Final Destination URL before you even click it.
       - Parameter Splitting: It separates the Base URL from complex Query Parameters for easier reading.
4. Optimized for Enterprise DashboardsStandard inspectors often fail on complex platforms due to security restrictions (CSP) or Shadow DOMs.
   - How it helps: <RUM>Inspector uses Direct Style Injection and Composed Path Tracking, meaning it works perfectly inside iFrames and complex SolarWinds "Monitoring Pack" dashboards where other tools fail.
   
