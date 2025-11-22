document.addEventListener("DOMContentLoaded", () => {
  const delayInput = document.getElementById("delayInput");
  const cooldownInput = document.getElementById("cooldownInput");
  const enableToggle = document.getElementById("enableToggle");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  chrome.storage.sync.get(
    { clickDelay: 0, cooldown: 20000, enabled: true },
    (data) => {
      delayInput.value = data.clickDelay;
      cooldownInput.value = data.cooldown;
      enableToggle.checked = data.enabled;
    }
  );

  saveBtn.addEventListener("click", () => {
    const delay = parseInt(delayInput.value, 10) || 0;
    const cooldown = parseInt(cooldownInput.value, 10) || 0;
    const enabled = enableToggle.checked;

    chrome.storage.sync.set({ clickDelay: delay, cooldown, enabled }, () => {
      status.textContent = `Saved! Delay: ${delay}ms, Cooldown: ${cooldown}ms, Enabled: ${enabled}`;
      setTimeout(() => (status.textContent = ""), 300);
    });
  });
});