let isCooldownActive = false; // Flag to track cooldown status

// --- URL change detection ---
let lastHref = location.href;

function emitUrlChangeIfNeeded() {
  if (location.href !== lastHref) {
    lastHref = location.href;
    onUrlChanged();
  }
}

function hookHistory() {
  const _pushState = history.pushState;
  const _replaceState = history.replaceState;

  history.pushState = function (...args) {
    _pushState.apply(this, args);
    emitUrlChangeIfNeeded();
  };

  history.replaceState = function (...args) {
    _replaceState.apply(this, args);
    emitUrlChangeIfNeeded();
  };

  window.addEventListener("popstate", emitUrlChangeIfNeeded);
}

// --- Settings ---
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { clickDelay: 0, cooldown: 20000, enabled: true },
      resolve
    );
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(str) {
  return str.replace(/\s+/g, " ").trim().toLowerCase();
}

function simulateRealClick(el) {
  ["mouseover", "mousedown", "mouseup", "click"].forEach((evt) =>
    el.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true }))
  );
  console.log(`✅ Clicked ${el.textContent}`);
}

// --- main logic ---
async function clickTeleportButton() {
  const { clickDelay, cooldown, enabled } = await getSettings();

  async function clickButtonRepeatedly(but) {
    const buttonCheck = but.textContent;
    const btnsGroup = but.closest(".btns");
    let numvarrep = 0;

    while (but.textContent !== "Failed_PoETB" && numvarrep < 3 && !but.disabled) {
      simulateRealClick(but);
      numvarrep++;
      await delay(200);

      if (btnsGroup && btnsGroup.style.display === "none") {
        let cooldownb = 50;
        but.textContent = "Failed_PoETB";
        console.log(`Button turned off, cooldown ${cooldownb}...`);
        await delay(cooldownb);
        return;
      }

      if (but.disabled) await delay(3000);

      console.log(
        `Button text ${but.textContent} num ${numvarrep}, button text check ${buttonCheck} before if...`
      );

      if (normalizeText(but.textContent) === "sent!") {
        but.textContent = "Sent_PoETB";
        let cooldownb = 100;
        console.log(`Cooldown ${cooldownb}...`);
        await delay(cooldownb);
        return;
      } else if (normalizeText(but.textContent) === "teleporting!") {
        but.textContent = "Teleport_PoETB";
        console.log(`Cooldown ${cooldown}...`);
        await delay(cooldown);
        return true;
      } else if (
        normalizeText(but.textContent) !== "sent!" &&
        normalizeText(but.textContent) !== "teleporting!" &&
        numvarrep === 3 &&
        but.textContent !== "Sent_PoETB" &&
        but.textContent !== "Teleport_PoETB"
      ) {
        but.textContent = "Failed_PoETB";
        let cooldownb = 100;
        console.log(`Cooldown ${cooldownb}...`);
        await delay(cooldownb);
        return;
      }
    }

    let cooldownb = 100;
    await delay(cooldownb);
    console.log(`Exception cooldown ${cooldownb}...`);
    return;
  }

  // Cooldown gate
  if (isCooldownActive) return;

  // Only run on /live
  const isLive = location.href.includes("/live");
  if (!enabled || !isLive) return;

  const button4 = [...document.querySelectorAll(".direct-btn")].find((b) => {
	const btns = b.closest(".btns");
    return (
      btns &&
      btns.style.display !== "none" &&
      !["Failed_PoETB", "Teleport_PoETB", "Sent_PoETB"].includes(b.textContent) &&
      !b.disabled
    );
  });

  if (button4) {
    console.log(
      `Found 'direct button' button! Clicking in ${clickDelay} ms (cooldown ${cooldown} ms)...`
    );

    isCooldownActive = true;
    setTimeout(async () => {
      try {
        await clickButtonRepeatedly(button4);
      } finally {
        isCooldownActive = false;
      }
    }, clickDelay);
  }
}

// --- Observer ---
let observer = null;
let observedBody = null;

function attachObserver() {
  const body = document.body;
  if (!body) return;

  // If PoE replaced <body>, we must rebind the observer
  if (observer && observedBody === body) return;

  if (observer) observer.disconnect();

  observer = new MutationObserver(() => {
    clickTeleportButton().catch(() => {});
  });

  observer.observe(body, { childList: true, subtree: true });
  observedBody = body;
}

// Called whenever URL changes
function onUrlChanged() {
  // When entering /live, run immediately + ensure observer is attached
  attachObserver();
  // Reset any “stuck” state when route changes
  isCooldownActive = false;

  // Fire an immediate check
  clickTeleportButton().catch(() => {});
}

// --- Boot ---
hookHistory();
attachObserver();
onUrlChanged();

// Backup polling
setInterval(() => {
  attachObserver();        // rebind if body changed
  emitUrlChangeIfNeeded(); // detect URL change even if something bypasses history hooks
  clickTeleportButton().catch(() => {});
}, 100);
