let lastRightClickedElement = null;
let lastX = 0;
let lastY = 0;

// 1. CAPTURE POSITION
document.addEventListener("contextmenu", (e) => {
    lastRightClickedElement = e.composedPath()[0] || e.target;
    lastX = e.clientX;
    lastY = e.clientY;
}, true);

// 2. INJECT CSS
const style = document.createElement('style');
style.textContent = `
    #solar-helper-float {
        position: fixed !important;
        z-index: 2147483647 !important;
        width: 320px;
        background: rgba(20, 20, 22, 0.96) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 14px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        color: #fff !important;
        font-family: 'Segoe UI', system-ui, sans-serif !important;
        pointer-events: auto;
        visibility: hidden;
    }
    .sh-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .sh-tag { font-size: 10px; background: #2563eb; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: white; }
    .sh-close { background: none; border: none; color: #888; cursor: pointer; font-size: 18px; }
    .sh-group { margin-bottom: 8px; }
    .sh-label { font-size: 9px; color: #9ca3af; text-transform: uppercase; display: block; font-weight: 600; margin-bottom: 2px; }
    .sh-wrapper { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.06); padding: 5px 8px; border-radius: 6px; }
    .sh-text { font-size: 11px; word-break: break-all; }
    .sh-copy { background: none; border: none; cursor: pointer; font-size: 12px; opacity: 0.6; padding: 0; margin-left: 8px; }
    .sh-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .sh-status { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; background: #333; margin-top: 5px; font-weight: bold; }
    .sh-success { color: #34d399; border: 1px solid #065f46; }
    .sh-warn { color: #fbbf24; border: 1px solid #92400e; }
    .sh-error { color: #f87171; border: 1px solid #991b1b; }
`;
document.documentElement.appendChild(style);

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "inspect_right_click" && lastRightClickedElement) {
        createFloatingWindow(lastRightClickedElement, lastX, lastY);
    }
});

async function createFloatingWindow(el, x, y) {
    const existing = document.getElementById('solar-helper-float');
    if (existing) existing.remove();

    const floatWin = document.createElement('div');
    floatWin.id = 'solar-helper-float';
    document.body.appendChild(floatWin);

    // Data Collection
    let elements = [];
    let current = el;
    let count = 0;
    while (current && current.tagName !== 'HTML' && count < 3) {
        elements.push({
            id: current.id,
            linkType: current.getAttribute('data-linktype'),
            linkDetail: current.getAttribute('data-linkdetail'),
            autoGroup: current.getAttribute('data-automation-group')
        });
        current = current.parentElement || (current.getRootNode() && current.getRootNode().host);
        count++;
    }

    const findInStack = (key) => elements.find(e => e[key])?.[key] || "N/A";
    const elementId = elements[0].id || "No ID";
    const textVal = el.innerText?.trim().substring(0, 50) || "No text";

    floatWin.innerHTML = `
        <div class="sh-header">
            <span style="font-weight:800; color:#3b82f6; font-size:12px;">&lt;RUM&gt;Inspector</span>
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="sh-tag">${el.tagName}</span>
                <button class="sh-close" id="sh-close-btn">✕</button>
            </div>
        </div>
        <div class="sh-group"><label class="sh-label">ID</label><div class="sh-wrapper"><span class="sh-text">${elementId}</span><button class="sh-copy" data-copy="${elementId}">📋</button></div></div>
        <div class="sh-group"><label class="sh-label">Text Content</label><div class="sh-wrapper"><span class="sh-text">${textVal}</span><button class="sh-copy" data-copy="${textVal}">📋</button></div></div>
        <div class="sh-grid">
            <div class="sh-group">
                <label class="sh-label">Data LinkType</label>
                <div class="sh-wrapper">
                    <span class="sh-text">${findInStack('linkType')}</span>
                    ${findInStack('linkType') !== "N/A" ? `<button class="sh-copy" data-copy="${findInStack('linkType')}">📋</button>` : ''}
                </div>
            </div>
            <div class="sh-group"><label class="sh-label">Auto-Group</label><div class="sh-wrapper"><span class="sh-text">${findInStack('autoGroup')}</span></div></div>
        </div>
        <div class="sh-group">
            <label class="sh-label">Data LinkDetail</label>
            <div class="sh-wrapper">
                <span class="sh-text">${findInStack('linkDetail')}</span>
                ${findInStack('linkDetail') !== "N/A" ? `<button class="sh-copy" data-copy="${findInStack('linkDetail')}">📋</button>` : ''}
            </div>
        </div>
        <div id="sh-link-section" style="display:none; border-top: 1px solid rgba(255,255,255,0.1); padding-top:10px;">
            <label class="sh-label">Link Analysis</label>
            <div id="sh-status-badge" class="sh-status">Checking...</div>
            <div id="sh-url-details"></div>
        </div>
    `;

    // SMART POSITIONING
    const winWidth = 320;
    const winHeight = floatWin.offsetHeight || 300;
    const padding = 15;

    let finalX = x + padding;
    if (finalX + winWidth > window.innerWidth) finalX = x - winWidth - padding;

    let finalY = y + padding;
    if (finalY + winHeight > window.innerHeight) finalY = y - winHeight - padding;

    floatWin.style.left = `${finalX}px`;
    floatWin.style.top = `${finalY}px`;
    floatWin.style.visibility = 'visible';

    document.getElementById('sh-close-btn').onclick = () => floatWin.remove();

    const link = el.tagName === 'A' ? el : el.closest('a');
    if (link && link.href.startsWith('http')) {
        document.getElementById('sh-link-section').style.display = 'block';
        processUrlData(link.href);
    }
}

function processUrlData(url) {
    const urlObj = new URL(url);
    const details = document.getElementById('sh-url-details');
    details.innerHTML = `<div class="sh-group" style="margin-top:10px;"><label class="sh-label">Base URL</label><div class="sh-wrapper"><span class="sh-text">${urlObj.origin + urlObj.pathname}</span><button class="sh-copy" data-copy="${urlObj.origin + urlObj.pathname}">📋</button></div></div>`;

    chrome.runtime.sendMessage({ action: "check_url_status", url: url }, (response) => {
        const badge = document.getElementById('sh-status-badge');
        if (!badge) return;
        if (response.redirected) {
            badge.innerText = `⚠️ Redirect (${response.status})`;
            badge.className = "sh-status sh-warn";
            details.innerHTML += `<div class="sh-group"><label class="sh-label">Redirect To</label><div class="sh-wrapper"><span class="sh-text">${response.finalUrl}</span><button class="sh-copy" data-copy="${response.finalUrl}">📋</button></div></div>`;
        } else {
            badge.innerText = response.status === 404 ? "❌ 404 Not Found" : `✅ ${response.status} OK`;
            badge.className = `sh-status ${response.status === 404 ? 'sh-error' : 'sh-success'}`;
        }
    });
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.sh-copy');
    if (btn) {
        navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(() => {
            btn.innerText = '✅';
            setTimeout(() => btn.innerText = '📋', 800);
        });
    }
});