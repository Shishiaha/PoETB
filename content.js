let isCooldownActive = false;  // Flag to track cooldown status

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { clickDelay: 0, cooldown: 20000, enabled: true },
      resolve
    );
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

async function clickTeleportButton() {
  const { clickDelay, cooldown, enabled } = await getSettings();

async function clickButtonRepeatedly(but) {
  const buttonCheck = but.textContent;
  const btnsGroup = but.closest('.btns');
  let numvarrep = 0;

  while (but.textContent !== "Failed_PoETB" && numvarrep < 3 && !but.disabled) {
    simulateRealClick(but);
    numvarrep++;
    await delay(200);

    if (btnsGroup && btnsGroup.style.display === 'none') {
      let cooldownb = 50;
      but.textContent = "Failed_PoETB";
      console.log(`Button turned off, cooldown ${cooldownb}...`);
      await delay(cooldownb);
      return;
    }

    if (but.disabled) await delay(3000);

    console.log(`Button text ${but.textContent} num ${numvarrep}, button text check ${buttonCheck} before if...`);

    if (normalizeText(but.textContent) === "sent!") {
      but.textContent = "Sent_PoETB";
      let cooldownb = 100;
      console.log(`Cooldown ${cooldownb}...`);
      await delay(cooldownb);
      return;
    }
    else if (normalizeText(but.textContent) === "teleporting!") {
      but.textContent = "Teleport_PoETB";
      console.log(`Cooldown ${cooldown}...`);
      await delay(cooldown);
      return true;
    }
    else if (normalizeText(but.textContent) !== "sent!" && normalizeText(but.textContent) !== "teleporting!" && numvarrep === 3 && but.textContent !== "Sent_PoETB" && but.textContent !== "Teleport_PoETB") {
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


  // Check if cooldown is active
  if (isCooldownActive) {
    console.log('Cooldown active, skipping execution...');
    return;
  }

  // Ensure the script only runs when enabled and on the correct page
  if (!enabled || window.location.href.indexOf("live") === -1) return;

  const button4 = [...document.querySelectorAll(".direct-btn")].find(
    (b) => b.closest('.btns').style.display !== 'none' && !["Failed_PoETB", "Teleport_PoETB", "Sent_PoETB"].includes(b.textContent) && !b.disabled
  );

  if (button4) {
    console.log(`Found 'direct button' button! Clicking in ${clickDelay} ms (cooldown ${cooldown} ms)...`);

    // Set cooldown flag and wait for delay before executing
    isCooldownActive = true;
    setTimeout(async () => {
      await clickButtonRepeatedly(button4);  // Perform the button click logic
      isCooldownActive = false;  // Reset cooldown flag after execution
    }, clickDelay);
  }
}

// Add observer to detect DOM mutations
const observer = new MutationObserver(() => {
  clickTeleportButton().then((clicked) => {
    if (clicked) observer.disconnect();
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// Backup check in case the observer misses it
setInterval(clickTeleportButton, 100);