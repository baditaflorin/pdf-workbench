import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { PDFDocument } from "pdf-lib";
import {
  getDocument,
  GlobalWorkerOptions,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import { enhanceFormFields } from "./formIntelligence";
import {
  buildPdfIntelligence,
  buildSourceId,
  canonicalIntelligence,
  errorToIntelligence,
  explainPdfError,
} from "./pdfIntelligence";
import { readFormFields } from "./pdfDocument";

type FixtureExpectation = {
  canOpen: boolean;
  pageCount?: number;
  minFormFields?: number;
  expectedConditions: string[];
  expectedShape: string;
  expectedErrorKind?: string;
  minimumTextCharacters?: number;
  maximumEmbeddedTextCharacters?: number;
  minimumMappedFieldRatio?: number;
  primaryAction: string;
};

const fixturesDir = join(process.cwd(), "test/fixtures/realdata");
const expectationFiles = (await readdir(fixturesDir))
  .filter((file) => file.endsWith(".expected.json"))
  .sort();

GlobalWorkerOptions.workerSrc = pathToFileURL(
  join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
).href;

describe("PDF intelligence on real data", () => {
  it.each(expectationFiles)(
    "%s matches its expected document contract",
    async (expectationFile) => {
      const fixtureId = expectationFile.replace(".expected.json", "");
      const pdfFile = `${fixtureId}.pdf`;
      const bytes = new Uint8Array(await readFile(`${fixturesDir}/${pdfFile}`));
      const expectation = JSON.parse(
        await readFile(`${fixturesDir}/${expectationFile}`, "utf8"),
      ) as FixtureExpectation;
      const sourceId = buildSourceId(pdfFile, bytes);

      const loaded = await PDFDocument.load(bytes)
        .then((doc) => ({ doc, error: null }))
        .catch((error: unknown) => ({ doc: null, error }));

      if (loaded.error || !loaded.doc) {
        const friendly = explainPdfError(loaded.error);
        const intelligence = errorToIntelligence(
          pdfFile,
          bytes.byteLength,
          sourceId,
          friendly,
        );

        expect(expectation.canOpen).toBe(false);
        expect(friendly.kind).toBe(expectation.expectedErrorKind);
        expect(friendly.title).not.toMatch(/PDFDocument|offset|xref|parse/i);
        expect(intelligence.shape.id).toBe(expectation.expectedShape);
        expect(intelligence.primaryAction).toBe(expectation.primaryAction);
        expect(
          intelligence.conditions.map((condition) => condition.id),
        ).toEqual(expect.arrayContaining(expectation.expectedConditions));
        return;
      }

      const doc = loaded.doc;
      const fields = enhanceFormFields(readFormFields(doc), {
        fileName: pdfFile,
      });
      const sample = await extractFixtureSample(bytes).catch(() => ({
        text: "",
        pagesSampled: 0,
      }));
      const intelligence = buildPdfIntelligence({
        fileName: pdfFile,
        sizeBytes: bytes.byteLength,
        pageCount: doc.getPageCount(),
        sourceId,
        fields,
        sampleText: sample.text,
        pagesSampled: sample.pagesSampled,
        analyzedAt: "2026-05-09T00:00:00.000Z",
      });
      const secondPass = buildPdfIntelligence({
        fileName: pdfFile,
        sizeBytes: bytes.byteLength,
        pageCount: doc.getPageCount(),
        sourceId,
        fields,
        sampleText: sample.text,
        pagesSampled: sample.pagesSampled,
        analyzedAt: "2026-05-09T00:00:00.000Z",
      });

      expect(expectation.canOpen).toBe(true);
      expect(intelligence.pageCount).toBe(expectation.pageCount);
      expect(fields.length).toBeGreaterThanOrEqual(
        expectation.minFormFields ?? 0,
      );
      expect(intelligence.shape.id).toBe(expectation.expectedShape);
      expect(intelligence.primaryAction).toBe(expectation.primaryAction);
      expect(intelligence.conditions.map((condition) => condition.id)).toEqual(
        expect.arrayContaining(expectation.expectedConditions),
      );
      expect(canonicalIntelligence(intelligence)).toEqual(
        canonicalIntelligence(secondPass),
      );

      if (expectation.minimumTextCharacters) {
        expect(
          intelligence.textStats.normalizedCharacters,
        ).toBeGreaterThanOrEqual(expectation.minimumTextCharacters);
      }

      if (expectation.maximumEmbeddedTextCharacters) {
        expect(intelligence.textStats.normalizedCharacters).toBeLessThanOrEqual(
          expectation.maximumEmbeddedTextCharacters,
        );
      }

      if (expectation.minimumMappedFieldRatio && fields.length > 0) {
        expect(
          intelligence.formStats.mappedFields / fields.length,
        ).toBeGreaterThanOrEqual(expectation.minimumMappedFieldRatio);
      }
    },
    15_000,
  );
});

describe("PDF intelligence synthetic edge cases", () => {
  it("classifies empty text as scan-like only when the document evidence supports it", () => {
    const intelligence = buildPdfIntelligence({
      fileName: "single-page-note.pdf",
      sizeBytes: 2048,
      pageCount: 1,
      sourceId: "single-page-note-2048-test",
      fields: [],
      sampleText: "OK",
      pagesSampled: 1,
    });

    expect(
      intelligence.conditions.map((condition) => condition.id),
    ).not.toContain("scanned");
  });

  it("turns parser offsets into a domain error", () => {
    const error = explainPdfError(
      new Error("Failed to parse PDF document offset=36099 invalid object"),
    );

    expect(error.kind).toBe("corrupt_pdf");
    expect(error.nextStep).toMatch(/Re-download|re-export|fresh/i);
  });

  it("detects huge documents from page count and size", () => {
    const intelligence = buildPdfIntelligence({
      fileName: "huge.pdf",
      sizeBytes: 12 * 1024 * 1024,
      pageCount: 600,
      sourceId: "huge-12582912-test",
      fields: [],
      sampleText: "Table of contents\nChapter 1\nChapter 2",
      pagesSampled: 3,
    });

    expect(intelligence.conditions.map((condition) => condition.id)).toContain(
      "large_document",
    );
  });

  it("normalizes weird spacing and detects right-to-left script", () => {
    const intelligence = buildPdfIntelligence({
      fileName: "rtl.pdf",
      sizeBytes: 4096,
      pageCount: 2,
      sourceId: "rtl-4096-test",
      fields: [],
      sampleText: "English\u00a0text\r\n\u05e9\u05dc\u05d5\u05dd",
      pagesSampled: 2,
    });

    expect(intelligence.conditions.map((condition) => condition.id)).toEqual(
      expect.arrayContaining(["mixed_language", "rtl_text"]),
    );
  });

  it("keeps malformed raw field names recoverable", () => {
    const fields = enhanceFormFields(
      [
        {
          name: "topmostSubform[0].Page1[0].f1_01[0]",
          type: "text",
          value: "",
        },
      ],
      { fileName: "unknown-form.pdf" },
    );
    const intelligence = buildPdfIntelligence({
      fileName: "unknown-form.pdf",
      sizeBytes: 8192,
      pageCount: 1,
      sourceId: "unknown-form-8192-test",
      fields,
      sampleText: "",
      pagesSampled: 1,
    });

    expect(intelligence.conditions.map((condition) => condition.id)).toContain(
      "fillable_form",
    );
    expect(intelligence.warnings.map((warning) => warning.id)).toContain(
      "raw-form-identifiers",
    );
  });
});

async function extractFixtureSample(bytes: Uint8Array) {
  const task = getDocument({
    data: bytes.slice(),
    useWorkerFetch: false,
  });
  const pdf = await task.promise;
  const pagesSampled = Math.min(pdf.numPages, 3);
  const chunks: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pagesSampled; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const text = await page.getTextContent();
      chunks.push(
        text.items
          .map((item) => ("str" in item ? String(item.str) : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
      );
    }
  } finally {
    await pdf.destroy();
  }

  return {
    text: chunks.join("\n\n"),
    pagesSampled,
  };
}
