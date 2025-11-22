chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ clickDelay: 0, cooldown: 20000, enabled: true });
  console.log("PoETB 1.3 installed with default settings.");
});
