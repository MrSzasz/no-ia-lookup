// Settings
let enabled: boolean = true;
let useIaFilter: boolean = true;
let useUdm: boolean = true;
let useSnippetFilter: boolean = true;

// Get the settings from the storage
chrome.storage.local.get(
  ["enabled", "useIaFilter", "useUdm", "useSnippetFilter"],
  (stored: Partial<Settings>) => {
    if (stored.enabled !== undefined) {
      enabled = stored.enabled;
    }
    if (stored.useIaFilter !== undefined) {
      useIaFilter = stored.useIaFilter;
    }
    if (stored.useUdm !== undefined) {
      useUdm = stored.useUdm;
    }
    if (stored.useSnippetFilter !== undefined) {
      useSnippetFilter = stored.useSnippetFilter;
    }
  },
);

// Listen for changes to the settings
chrome.storage.onChanged.addListener(
  (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.enabled) {
      enabled = changes.enabled.newValue;
    }
    if (changes.useIaFilter) {
      useIaFilter = changes.useIaFilter.newValue;
    }
    if (changes.useUdm) {
      useUdm = changes.useUdm.newValue;
    }
    if (changes.useSnippetFilter) {
      useSnippetFilter = changes.useSnippetFilter.newValue;
    }
  },
);

// Track the last redirected query per tab to respect manual removal of -"ai"
const pendingRedirectByTab = new Map<number, string>();

// Listen for before navigation events
chrome.webNavigation.onBeforeNavigate.addListener(
  (details: chrome.webNavigation.WebNavigationParentedCallbackDetails) => {
    if (details.frameId !== 0) {
      return;
    }

    const url = new URL(details.url);
    const query = url.searchParams.get("q");
    if (!query || !enabled) {
      return;
    }

    // Skip Google Images
    if (url.searchParams.get("tbm") === "isch") {
      return;
    }

    let shouldRedirect = false;

    if (useUdm && url.searchParams.get("udm") !== "14") {
      url.searchParams.set("udm", "14");
      shouldRedirect = true;
    }

    if (useIaFilter) {
      if (!query.endsWith(` -"ai"`)) {
        if (pendingRedirectByTab.get(details.tabId) === query) {
          // User manually removed -"ai" — respect it and clear the skip entry
          pendingRedirectByTab.delete(details.tabId);
        } else {
          pendingRedirectByTab.set(details.tabId, query);
          url.searchParams.set("q", query + ` -"ai"`);
          shouldRedirect = true;
        }
      }
    }

    if (shouldRedirect) {
      chrome.tabs.update(details.tabId, { url: url.toString() });
    }
  },
  { url: [{ hostContains: ".google.", pathPrefix: "/search" }] },
);

// CSS injected at onCommitted (before the page renders) to prevent featured snippet flash
chrome.webNavigation.onCommitted.addListener(
  (details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => {
    if (details.frameId !== 0 || !enabled || !useSnippetFilter) {
      return;
    }

    chrome.scripting.insertCSS({
      target: { tabId: details.tabId },
      css: `.ULSxyf:has(.xpdopen) { display: none !important; }`,
    });
  },
  { url: [{ hostContains: ".google.", pathEquals: "/search" }] },
);
