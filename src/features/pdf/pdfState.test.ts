import { describe, expect, it } from "vitest";
import {
  createPageStates,
  deletePage,
  movePage,
  restorePages,
  rotatePage,
  visiblePages,
} from "./pdfState";

const pages = createPageStates([
  { width: 100, height: 200 },
  { width: 100, height: 200 },
  { width: 100, height: 200 },
]);

describe("pdf page state", () => {
  it("moves visible pages without losing source indexes", () => {
    const moved = movePage(pages, "page-2", -1);

    expect(moved.map((page) => page.sourceIndex)).toEqual([1, 0, 2]);
  });

  it("keeps at least one page visible", () => {
    const once = deletePage(pages, "page-1");
    const twice = deletePage(once, "page-2");
    const third = deletePage(twice, "page-3");

    expect(visiblePages(third)).toHaveLength(1);
  });

  it("rotates pages in 90 degree steps", () => {
    const rotated = rotatePage(rotatePage(pages, "page-1"), "page-1");

    expect(rotated[0].rotation).toBe(180);
  });

  it("restores deleted pages", () => {
    const restored = restorePages(deletePage(pages, "page-1"));

    expect(restored.every((page) => !page.deleted)).toBe(true);
  });
});
