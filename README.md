<img width="440" height="280" alt="small" src="https://github.com/user-attachments/assets/0a68a111-aeab-4e3d-834c-6fa8ab4e907f" />


# NoAI Lookup

Browser extension for **Chromium** and **Firefox** that automatically filters AI-generated content from Google Search results.

It appends `-"ai"` to your searches, forces web-only results, and hides the featured snippet — all configurable from the popup.

---

## Features

- **Appends `-"ai"`** to every Google search query to exclude results containing the word *ai*
- **Forces web-only results** via `udm=14`, removing Google AI Overview entirely
- **Hides the featured snippet** box at the top of search results
- Works on **all Google domains** — `.google.com`, `.google.es`, `.google.com.ar`, `.google.co.uk`, etc.
- Works from the **address bar** and from `google.com` directly
- **Respects manual removal** — if you delete `-"ai"` from a query, it won't be re-added
- **Skips Google Images** — searches with `tbm=isch` are left untouched
- Each filter is **independently toggleable** from the popup
- The extension can be fully **paused** without uninstalling

---

## Installation

### Chrome / Chromium (Edge, Brave, Opera, Vivaldi)

#### From the Chrome Web Store *(coming soon)*

#### Manual installation

1. Download `noialookup.zip` from the [Releases](https://github.com/MrSzasz/no-ia-lookup/releases) page
2. Extract the ZIP to a folder
3. Go to `chrome://extensions/`
4. Enable **Developer mode** (toggle in the top-right corner)
5. Click **Load unpacked** and select the extracted folder

### Firefox

> **Note:** Temporary add-ons in Firefox are removed when the browser closes. For permanent installation, the extension must be signed via [addons.mozilla.org](https://addons.mozilla.org). Signing is free.

#### Manual (temporary) installation

1. Download `noialookup-firefox.zip` from the [Releases](https://github.com/MrSzasz/no-ia-lookup/releases) page
2. Go to `about:debugging`
3. Click **This Firefox**
4. Click **Load Temporary Add-on**
5. Select the `noialookup-firefox.zip` file directly

---

## Filters

| Filter | Default | Description |
| --- | --- | --- |
| **Append `-"ai"`** | On | Appends `-"ai"` to the search query. The quoted form excludes exact matches of the word *ai*, which is less aggressive than the unquoted `-ia` operator and avoids triggering Google's spell-checker. |
| **Web results only** | On | Adds `udm=14` to the URL, which forces Google to show only traditional web results and removes the AI Overview panel. |
| **Hide featured snippet** | On | Injects CSS before the page renders to hide the `.ULSxyf` container that wraps the featured answer box. Injected at `onCommitted` to prevent the box from flashing in before disappearing. |

All filters work independently. Disabling all filters is equivalent to pausing the extension.

---

## How it works

The extension uses Manifest V3 APIs with no content scripts — all logic runs in the background service worker (Chrome) or background script (Firefox).

### URL interception

`chrome.webNavigation.onBeforeNavigate` fires before a navigation commits. When a Google search is detected, the extension modifies the URL (adding `udm=14` and/or `-"ai"`) and calls `chrome.tabs.update` to redirect the tab to the modified URL.

### Skip logic

When the extension redirects a search, it stores the original query in a `Map<tabId, query>`. If the next navigation for that tab has the same query *without* `-"ai"`, it means the user manually removed it — the extension respects this and skips the redirect.

### Featured snippet hiding

`chrome.scripting.insertCSS` is called at `onCommitted` (before the page renders) so the CSS rule is active from the very first paint, preventing any visual flash.

The CSS rule used is:

```css
.ULSxyf:has(.xpdopen) { display: none !important; }
```

`.ULSxyf` is the outermost wrapper of the featured snippet block. Hiding it (rather than the inner `block-component`) ensures the surrounding margins and spacing are also removed.

### URL filter scope

The `hostContains: ".google."` URL filter matches all Google country domains without needing to enumerate them, including `google.com`, `google.es`, `google.com.ar`, `google.co.uk`, `google.com.br`, etc.

---

## Build from source

**Requirements:** Node.js 18+, npm

```bash
# Install dependencies (TypeScript + @types/chrome)
npm install

# Compile TypeScript → JavaScript
npm run build

# Watch mode (recompiles on save)
npm run watch
```

TypeScript sources live in `src/`. The compiled `background.js` and `popup.js` are output to `src/` alongside the sources and are gitignored — run `npm run build` before loading the extension unpacked.

---

## Project structure

```text
no-ia-lookup/
├── src/
│   ├── types.d.ts          # Shared TypeScript interfaces (global, no imports needed)
│   ├── background.ts       # Service worker: URL interception and CSS injection
│   └── popup.ts            # Popup UI logic
├── styles/
│   └── popup.css           # Popup styles
├── lib/
│   └── urlTransform.ts     # Pure URL logic (no Chrome APIs — used by tests)
├── tests/
│   └── urlTransform.test.ts
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json           # Chrome / Chromium manifest (MV3, service worker)
├── manifest.firefox.json   # Firefox manifest (MV3, background scripts array)
├── popup.html
├── tsconfig.json
├── package.json
└── .gitignore
```

---

## Permissions used

| Permission | Why |
| --- | --- |
| `webNavigation` | Listen to navigation events to detect Google searches |
| `scripting` | Inject CSS to hide the featured snippet |
| `storage` | Persist filter settings across browser sessions |
| `host_permissions` (Google domains) | Required by `scripting` to inject CSS on Google pages. Scoped to 42 specific Google country domains instead of `<all_urls>`. |

---

## License

MIT — free to use, modify, and distribute.
