import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { mergePdfBytes } from "./pdfDocument";

async function buildSamplePdf(
  label: string,
  pageCount: number,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i += 1) {
    const page = doc.addPage([200, 300]);
    page.drawText(`${label} page ${i + 1}`, { x: 20, y: 200, size: 14, font });
  }
  return doc.save();
}

describe("mergePdfBytes", () => {
  it("concatenates every input PDF in order", async () => {
    const a = await buildSamplePdf("A", 2);
    const b = await buildSamplePdf("B", 3);
    const c = await buildSamplePdf("C", 1);

    const merged = await mergePdfBytes([
      { name: "a.pdf", bytes: a },
      { name: "b.pdf", bytes: b },
      { name: "c.pdf", bytes: c },
    ]);

    expect(merged.pageCount).toBe(6);
    // Sanity-check that the bytes are a real PDF we can re-open.
    const reloaded = await PDFDocument.load(merged.bytes);
    expect(reloaded.getPageCount()).toBe(6);
  });

  it("preserves a single-input PDF unchanged in page count", async () => {
    const a = await buildSamplePdf("Solo", 4);
    const merged = await mergePdfBytes([{ name: "solo.pdf", bytes: a }]);
    expect(merged.pageCount).toBe(4);
  });

  it("throws on an empty source list", async () => {
    await expect(mergePdfBytes([])).rejects.toThrow(/at least one/i);
  });

  it("surfaces the offending file name when a source is not a PDF", async () => {
    const valid = await buildSamplePdf("V", 1);
    const garbage = new TextEncoder().encode("this is not a pdf");
    await expect(
      mergePdfBytes([
        { name: "valid.pdf", bytes: valid },
        { name: "broken.pdf", bytes: garbage },
      ]),
    ).rejects.toThrow(/broken\.pdf/);
  });
});
