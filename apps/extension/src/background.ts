// Background service worker — v1 responsibilities:
// - Stores API key in chrome.storage.local (done via popup)
// - No other active responsibilities in v1

chrome.runtime.onInstalled.addListener(() => {
  console.log("Sanchay extension installed");
});
