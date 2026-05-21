/// <reference path="../src/types.d.ts" />

// Applies the active filters to a Google search URL. Returns the (possibly modified) URL and whether a redirect is needed.
export const applyFilters = (
  rawUrl: string,
  options: FilterOptions,
  pendingRedirectQuery: string | undefined,
): TransformResult => {
  const url = new URL(rawUrl);
  const query = url.searchParams.get("q");

  if (!query) {
    return { url: rawUrl, modified: false };
  }

  // Skip all filters for Google Images
  if (url.searchParams.get("tbm") === "isch") {
    return { url: rawUrl, modified: false };
  }

  let modified = false;

  if (options.useUdm && url.searchParams.get("udm") !== "14") {
    url.searchParams.set("udm", "14");
    modified = true;
  }

  if (options.useIaFilter) {
    if (!query.endsWith(` -"ia"`)) {
      // If the user previously removed -"ia" from this exact query, skip
      if (pendingRedirectQuery === query) {
        return { url: rawUrl, modified: false };
      }

      url.searchParams.set("q", query + ` -"ia"`);
      modified = true;
    }
  }

  return { url: url.toString(), modified };
};
