const API_BASE = "http://localhost:3001/api/v1";

const setupEl = document.getElementById("setup")!;
const mainEl = document.getElementById("main")!;
const apiKeyInput = document.getElementById("api-key-input") as HTMLInputElement;
const saveKeyBtn = document.getElementById("save-key-btn")!;
const setupStatus = document.getElementById("setup-status")!;
const collectionSelect = document.getElementById("collection-select") as HTMLSelectElement;
const noteInput = document.getElementById("note-input") as HTMLTextAreaElement;
const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
const mainStatus = document.getElementById("main-status")!;
const previewSection = document.getElementById("preview-section")!;

let currentUrl = "";
let currentApiKey = "";

async function getApiKey(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get("apiKey", (result) => {
      resolve((result["apiKey"] as string) ?? null);
    });
  });
}

async function setApiKey(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ apiKey: key }, resolve);
  });
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] ?? null);
    });
  });
}

function showSetup() {
  setupEl.classList.remove("hidden");
  mainEl.classList.add("hidden");
}

function showMain() {
  setupEl.classList.add("hidden");
  mainEl.classList.remove("hidden");
}

function setStatus(el: HTMLElement, msg: string, type: "error" | "success" | "") {
  el.textContent = msg;
  el.className = `status${type ? ` ${type}` : ""}`;
}

async function fetchCollections(apiKey: string) {
  const res = await fetch(`${API_BASE}/collections`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data: { id: string; name: string; emoji: string }[] };
  return data.data;
}

async function fetchMetadata(url: string, apiKey: string) {
  const res = await fetch(`${API_BASE}/metadata?url=${encodeURIComponent(url)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    data: { title: string; favicon: string | null; type: string };
  };
  return data.data;
}

async function init() {
  const apiKey = await getApiKey();
  if (!apiKey) {
    showSetup();
    return;
  }

  currentApiKey = apiKey;
  showMain();

  const tab = await getCurrentTab();
  if (tab?.url) {
    currentUrl = tab.url;

    // Show preview
    fetchMetadata(currentUrl, apiKey).then((meta) => {
      if (!meta) return;
      previewSection.innerHTML = `
        <div class="preview">
          ${meta.favicon ? `<img src="${meta.favicon}" alt="" onerror="this.style.display='none'" />` : ""}
          <span class="title">${meta.title}</span>
        </div>
      `;
    });
  }

  // Load collections
  fetchCollections(apiKey).then((collections) => {
    for (const c of collections) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.emoji} ${c.name}`;
      collectionSelect.appendChild(opt);
    }
  });
}

saveKeyBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  if (!key.startsWith("sk_")) {
    setStatus(setupStatus, "Key must start with sk_", "error");
    return;
  }

  // Verify the key works
  setStatus(setupStatus, "Verifying…", "");
  const res = await fetch(`${API_BASE}/collections`, {
    headers: { Authorization: `Bearer ${key}` },
  }).catch(() => null);

  if (!res?.ok) {
    setStatus(setupStatus, "Invalid key — check and try again", "error");
    return;
  }

  await setApiKey(key);
  setStatus(setupStatus, "Connected!", "success");
  setTimeout(() => init(), 500);
});

saveBtn.addEventListener("click", async () => {
  if (!currentUrl || !currentApiKey) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";
  setStatus(mainStatus, "", "");

  const body = {
    url: currentUrl,
    collectionId: collectionSelect.value || undefined,
    notes: noteInput.value.trim() || undefined,
  };

  const res = await fetch(`${API_BASE}/resources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentApiKey}`,
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!res?.ok) {
    setStatus(mainStatus, "Failed to save. Try again.", "error");
    saveBtn.disabled = false;
    saveBtn.textContent = "Save to Sanchay";
    return;
  }

  setStatus(mainStatus, "Saved!", "success");
  setTimeout(() => window.close(), 800);
});

init().catch(console.error);
