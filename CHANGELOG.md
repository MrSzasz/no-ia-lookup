# Changelog

All notable changes to NoAI Lookup are documented here.

---

## [1.1.2] — 2026-05-22

### Changed

- Replaced `<all_urls>` host permission with an explicit list of 42 Google country domains to reduce review scope and follow Chrome Web Store best practices

---

## [1.1.1] — 2026-05-21

### Changed

- Renamed extension from "NoIA Lookup" to "NoAI Lookup"

---

## [1.1.0] — 2026-05-21

### Changed

- Replaced `-"ia"` filter with `-"ai"` to use the standard English term for AI

---

## [1.0.0] — 2026-05-21

### Added

- Initial release

#### Core filtering

- Appends `-"ia"` to Google search queries to exclude AI-related results
- Forces web-only results via `udm=14` parameter, removing Google AI Overview
- Hides the featured snippet via CSS injection (`.ULSxyf:has(.xpdopen)`)
- All three filters are independently toggleable from the popup

#### Search interception

- Intercepts searches on all Google domains (`hostContains: ".google."`) — covers `.google.com`, `.google.es`, `.google.com.ar`, `.google.co.uk`, and all other country variants
- Intercepts address bar searches in addition to searches initiated from `google.com`
- Skips Google Images searches (`tbm=isch`)

#### Skip logic

- Tracks redirected queries per tab — if the user manually removes `-"ia"` from a query, the extension detects this and does not re-add it for that search

#### Anti-flash

- CSS for featured snippet hiding is injected at `onCommitted` (before the page renders) to prevent the snippet from briefly appearing and then disappearing

#### Popup UI

- Dark theme popup (260px wide)
- Status card showing Active / Paused state with animated dot indicator
- Main enable/disable toggle
- Three independent filter toggles with labels and descriptions
- Sub-toggles are disabled and dimmed when the extension is paused

#### Browser support

- Chrome / Chromium (MV3 service worker) — `EXT_noialookup.zip`
- Firefox 109+ (MV3 background scripts) — `EXT_noialookup_firefox.zip`
- Also compatible with Chromium-based browsers: Edge, Brave, Opera, Vivaldi

#### Developer experience

- TypeScript source in `src/` with strict mode enabled
- Shared interfaces in `src/types.d.ts` (ambient globals, no imports needed)
- Pure URL logic extracted to `lib/urlTransform.ts` for unit testing
- 14 unit tests via Vitest covering all filter combinations and edge cases
- `@types/chrome` for Chrome extension API types
- `npm run build` / `npm run watch` / `npm test` scripts
