import type { PdfPageState } from "./types";

export function createPageStates(
  sizes: Array<{ width: number; height: number; rotation?: number }>,
): PdfPageState[] {
  return sizes.map((size, index) => ({
    id: `page-${index + 1}`,
    sourceIndex: index,
    label: `Page ${index + 1}`,
    width: size.width,
    height: size.height,
    rotation: normalizeRotation(size.rotation ?? 0),
    deleted: false,
  }));
}

export function visiblePages(pages: PdfPageState[]) {
  return pages.filter((page) => !page.deleted);
}

export function selectedOrFirstVisible(
  pages: PdfPageState[],
  selectedId: string | null,
) {
  const selected = selectedId
    ? pages.find((page) => page.id === selectedId && !page.deleted)
    : null;
  return selected ?? visiblePages(pages)[0] ?? null;
}

export function movePage(
  pages: PdfPageState[],
  pageId: string,
  direction: -1 | 1,
) {
  const next = [...pages];
  const visible = visiblePages(next);
  const visibleIndex = visible.findIndex((page) => page.id === pageId);
  const swapWith = visible[visibleIndex + direction];

  if (visibleIndex < 0 || !swapWith) {
    return pages;
  }

  const sourceIndex = next.findIndex((page) => page.id === pageId);
  const targetIndex = next.findIndex((page) => page.id === swapWith.id);
  [next[sourceIndex], next[targetIndex]] = [
    next[targetIndex],
    next[sourceIndex],
  ];
  return next;
}

export function rotatePage(pages: PdfPageState[], pageId: string) {
  return pages.map((page) =>
    page.id === pageId
      ? { ...page, rotation: normalizeRotation(page.rotation + 90) }
      : page,
  );
}

export function deletePage(pages: PdfPageState[], pageId: string) {
  if (visiblePages(pages).length <= 1) {
    return pages;
  }

  return pages.map((page) =>
    page.id === pageId ? { ...page, deleted: true } : page,
  );
}

export function restorePages(pages: PdfPageState[]) {
  return pages.map((page) => ({ ...page, deleted: false }));
}

function normalizeRotation(rotation: number) {
  return ((rotation % 360) + 360) % 360;
}
