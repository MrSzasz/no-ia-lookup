import { describe, it, expect } from "vitest";
import { applyFilters } from "../lib/urlTransform";

const GOOGLE_SEARCH = "https://www.google.com/search?q=typescript";
const GOOGLE_ES = "https://www.google.es/search?q=typescript";
const GOOGLE_AR = "https://www.google.com.ar/search?q=typescript";

describe("applyFilters", () => {
  describe("ia filter", () => {
    it('appends -"ia" to a plain query', () => {
      const result = applyFilters(
        GOOGLE_SEARCH,
        { useIaFilter: true, useUdm: false },
        undefined,
      );

      expect(result.modified).toBe(true);
      expect(new URL(result.url).searchParams.get("q")).toBe(
        `typescript -"ia"`,
      );
    });

    it('does not append -"ia" if already present', () => {
      const url = `https://www.google.com/search?q=typescript+-"ia"`;
      const result = applyFilters(
        url,
        { useIaFilter: true, useUdm: false },
        undefined,
      );

      expect(result.modified).toBe(false);
    });

    it('skips redirect when the user removed -"ia" manually', () => {
      const result = applyFilters(
        GOOGLE_SEARCH,
        { useIaFilter: true, useUdm: false },
        "typescript",
      );

      expect(result.modified).toBe(false);
    });

    it("does not skip when the pending query is different", () => {
      const result = applyFilters(
        GOOGLE_SEARCH,
        { useIaFilter: true, useUdm: false },
        "something else",
      );

      expect(result.modified).toBe(true);
    });

    it("does nothing when useIaFilter is false", () => {
      const result = applyFilters(
        GOOGLE_SEARCH,
        { useIaFilter: false, useUdm: false },
        undefined,
      );

      expect(result.modified).toBe(false);
      expect(new URL(result.url).searchParams.get("q")).toBe("typescript");
    });
  });

  describe("udm filter", () => {
    it("adds udm=14 when not present", () => {
      const result = applyFilters(
        GOOGLE_SEARCH,
        { useIaFilter: false, useUdm: true },
        undefined,
      );

      expect(result.modified).toBe(true);
      expect(new URL(result.url).searchParams.get("udm")).toBe("14");
    });

    it("does not add udm=14 when already present", () => {
      const url = "https://www.google.com/search?q=typescript&udm=14";
      const result = applyFilters(
        url,
        { useIaFilter: false, useUdm: true },
        undefined,
      );

      expect(result.modified).toBe(false);
    });

    it("does nothing when useUdm is false", () => {
      const result = applyFilters(
        GOOGLE_SEARCH,
        { useIaFilter: false, useUdm: false },
        undefined,
      );

      expect(result.modified).toBe(false);
      expect(new URL(result.url).searchParams.get("udm")).toBeNull();
    });
  });

  describe("both filters combined", () => {
    it('applies both udm=14 and -"ia" in one pass', () => {
      const result = applyFilters(
        GOOGLE_SEARCH,
        { useIaFilter: true, useUdm: true },
        undefined,
      );

      expect(result.modified).toBe(true);

      const resultUrl = new URL(result.url);

      expect(resultUrl.searchParams.get("udm")).toBe("14");
      expect(resultUrl.searchParams.get("q")).toBe(`typescript -"ia"`);
    });
  });

  describe("google images", () => {
    it("skips all filters for image searches (tbm=isch)", () => {
      const imageUrl = "https://www.google.com/search?q=cats&tbm=isch";
      const result = applyFilters(
        imageUrl,
        { useIaFilter: true, useUdm: true },
        undefined,
      );

      expect(result.modified).toBe(false);
      expect(result.url).toBe(imageUrl);
    });
  });

  describe("edge cases", () => {
    it("returns unmodified when there is no q parameter", () => {
      const url = "https://www.google.com/search";
      const result = applyFilters(
        url,
        { useIaFilter: true, useUdm: true },
        undefined,
      );

      expect(result.modified).toBe(false);
    });

    it("works on google.es", () => {
      const result = applyFilters(
        GOOGLE_ES,
        { useIaFilter: true, useUdm: false },
        undefined,
      );

      expect(new URL(result.url).searchParams.get("q")).toBe(
        `typescript -"ia"`,
      );
    });

    it("works on google.com.ar", () => {
      const result = applyFilters(
        GOOGLE_AR,
        { useIaFilter: true, useUdm: false },
        undefined,
      );

      expect(new URL(result.url).searchParams.get("q")).toBe(
        `typescript -"ia"`,
      );
    });

    it("preserves existing query parameters", () => {
      const url = "https://www.google.com/search?q=typescript&hl=es&gl=ar";
      const result = applyFilters(
        url,
        { useIaFilter: true, useUdm: true },
        undefined,
      );
      const resultUrl = new URL(result.url);

      expect(resultUrl.searchParams.get("hl")).toBe("es");
      expect(resultUrl.searchParams.get("gl")).toBe("ar");
    });
  });
});
