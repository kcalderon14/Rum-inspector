chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "rum-inspector-inspect",
    title: "Inspect with <RUM>Inspector",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "rum-inspector-inspect") {
    // Target the specific frame that was clicked
    chrome.tabs.sendMessage(tab.id, 
      { action: "inspect_right_click" }, 
      { frameId: info.frameId }
    );
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "check_url_status") {
    fetch(request.url, { method: 'GET', redirect: 'follow' })
      .then(response => {
        sendResponse({
          status: response.status,
          redirected: response.redirected,
          finalUrl: response.url
        });
      })
      .catch(() => sendResponse({ error: true }));
    return true; // Keep channel open
  }
});