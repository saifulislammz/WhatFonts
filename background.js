// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabled: true });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getState') {
    chrome.storage.local.get('isEnabled', (data) => {
      sendResponse({ isEnabled: data.isEnabled });
    });
    return true;
  }
}); 