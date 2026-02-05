chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ clickDelay: 0, cooldown: 20000, enabled: true });
  console.log("PoETB 1.3 installed with default settings.");
});
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  if (!details.url) return;
  if (!details.url.includes("/live")) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: details.tabId, allFrames: true },
      files: ["content.js"],
    });
  } catch (e) {
    // ignore (frame may disappear quickly)
  }
}, { url: [{ hostContains: "pathofexile.com" }] });
