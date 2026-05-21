// UI elements
const mainToggle = document.getElementById("toggleMain") as HTMLInputElement;
const iaToggle = document.getElementById("toggleIa") as HTMLInputElement;
const udmToggle = document.getElementById("toggleUdm") as HTMLInputElement;
const snippetToggle = document.getElementById(
  "toggleSnippet",
) as HTMLInputElement;
const statusText = document.getElementById("statusText") as HTMLElement;
const statusCard = document.getElementById("card") as HTMLElement;
const statusDot = document.getElementById("dot") as HTMLElement;
const iaRow = document.getElementById("rowIa") as HTMLElement;
const udmRow = document.getElementById("rowUdm") as HTMLElement;
const snippetRow = document.getElementById("rowSnippet") as HTMLElement;

// Update the UI based on the settings
const updateUI = ({
  enabled,
  useIaFilter,
  useUdm,
  useSnippetFilter,
}: Settings): void => {
  mainToggle.checked = enabled;
  iaToggle.checked = useIaFilter;
  udmToggle.checked = useUdm;
  snippetToggle.checked = useSnippetFilter;

  statusText.textContent = enabled ? "Active" : "Paused";
  statusText.className = "card-value " + (enabled ? "active" : "paused");
  statusCard.className = "card " + (enabled ? "active" : "paused");
  statusDot.className = "dot " + (enabled ? "active" : "");

  const isDisabled = !enabled;
  [iaToggle, udmToggle, snippetToggle].forEach(
    (toggle) => (toggle.disabled = isDisabled),
  );
  [iaRow, udmRow, snippetRow].forEach(
    (row) => (row.className = "row" + (isDisabled ? " disabled" : "")),
  );
};

// Get the settings from the storage
chrome.storage.local.get(
  ["enabled", "useIaFilter", "useUdm", "useSnippetFilter"],
  (stored: { [key: string]: unknown }) => {
    updateUI({
      enabled: stored.enabled !== false,
      useIaFilter: stored.useIaFilter !== false,
      useUdm: stored.useUdm !== false,
      useSnippetFilter: stored.useSnippetFilter !== false,
    });
  },
);

// Save the settings to the storage
const saveSettings = (): void => {
  const settings: Settings = {
    enabled: mainToggle.checked,
    useIaFilter: iaToggle.checked,
    useUdm: udmToggle.checked,
    useSnippetFilter: snippetToggle.checked,
  };

  chrome.storage.local.set(settings);
  updateUI(settings);
};

// Add event listeners to the toggles
[mainToggle, iaToggle, udmToggle, snippetToggle].forEach((toggle) =>
  toggle.addEventListener("change", saveSettings),
);
