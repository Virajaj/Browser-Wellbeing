let activeTabId = null;
let activeDomain = null;
let startTime = null;

// Extract domain safely
function getDomain(url) {
  try {
    if (!url.startsWith("http")) return null;
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// Save time spent
function saveTime(domain, timeSpent) {
  if (!domain || timeSpent <= 0) return;

  chrome.storage.local.get({ usage: {} }, (result) => {
    const usage = result.usage;
    usage[domain] = (usage[domain] || 0) + timeSpent;
    chrome.storage.local.set({ usage });
  });
}

// Start tracking a tab
function startTracking(tab) {
  const domain = getDomain(tab.url);
  if (!domain) return;

  activeTabId = tab.id;
  activeDomain = domain;
  startTime = Date.now();
}

// Stop tracking current tab
function stopTracking() {
  if (activeDomain && startTime) {
    saveTime(activeDomain, Date.now() - startTime);
  }
  activeTabId = null;
  activeDomain = null;
  startTime = null;
}

// INIT on install / reload
function initTracking() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length > 0) startTracking(tabs[0]);
  });
}

chrome.runtime.onInstalled.addListener(initTracking);
chrome.runtime.onStartup.addListener(initTracking);

// Tab switch
chrome.tabs.onActivated.addListener(({ tabId }) => {
  stopTracking();
  chrome.tabs.get(tabId, startTracking);
});

// URL change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    stopTracking();
    startTracking(tab);
  }
});

// Window focus change
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTracking();
  } else {
    initTracking();
  }
});

console.log("Browser Wellbeing background running");
