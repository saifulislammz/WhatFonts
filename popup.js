const toggleSwitch = document.getElementById('toggleExtension');

// Load initial state
chrome.storage.local.get('isEnabled', (data) => {
  toggleSwitch.checked = data.isEnabled;
});

// Handle toggle changes
toggleSwitch.addEventListener('change', (e) => {
  const isEnabled = e.target.checked;
  chrome.storage.local.set({ isEnabled });
  
  // Send message to active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'toggleExtension', isEnabled });
    }
  });
}); 