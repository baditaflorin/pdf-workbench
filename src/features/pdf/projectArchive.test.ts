import { describe, expect, it } from "vitest";
import { exportProjectArchive, importProjectArchive } from "./projectArchive";
import type { PdfProject } from "./types";

describe("project archive", () => {
  it("round-trips a project state file without losing canonical work", () => {
    const project = makeProject();
    const archive = exportProjectArchive(
      project,
      "page-1",
      "0.3.0",
      "test-commit",
      "2026-05-09T00:00:00.000Z",
    );
    const restored = importProjectArchive(archive);

    expect(restored.selectedPageId).toBe("page-1");
    expect(restored.project.fileName).toBe(project.fileName);
    expect(restored.project.bytes).toEqual(project.bytes);
    expect(restored.project.pages).toEqual(project.pages);
    expect(restored.project.fields).toEqual(project.fields);
    expect(restored.project.textStamps).toEqual(project.textStamps);
    expect(restored.project.intelligence.shape.id).toBe("generic_pdf");
  });

  it("rejects malformed state files", () => {
    expect(() => importProjectArchive('{"schemaVersion":"wrong"}')).toThrow();
  });
});

function makeProject(): PdfProject {
  return {
    id: "project-1",
    sourceId: "sample-3-test",
    fileName: "sample.pdf",
    sizeBytes: 3,
    bytes: new Uint8Array([1, 2, 3]),
    pages: [
      {
        id: "page-1",
        sourceIndex: 0,
        label: "Page 1",
        width: 612,
        height: 792,
        rotation: 0,
        deleted: false,
      },
    ],
    fields: [],
    textStamps: [
      {
        id: "stamp-1",
        pageId: "page-1",
        text: "Approved",
        x: 72,
        y: 72,
        fontSize: 14,
        color: "#146c74",
      },
    ],
    signatureStamps: [],
    ocrResults: [],
    embeddedText: "Page 1\nSample",
    intelligence: {
      schemaVersion: "pdf-intelligence.v1",
      sourceId: "sample-3-test",
      sizeBytes: 3,
      pageCount: 1,
      conditions: [
        {
          id: "clean_text",
          label: "Clean text PDF",
          confidence: 75,
          reason: "test",
        },
      ],
      shape: {
        id: "generic_pdf",
        label: "General PDF",
        confidence: 70,
        reason: "test",
      },
      primaryAction: "review",
      summary: "General PDF.",
      textStats: {
        sampleCharacters: 6,
        normalizedCharacters: 6,
        pagesSampled: 1,
        hasRtlScript: false,
        hasMixedScripts: false,
      },
      formStats: {
        totalFields: 0,
        mappedFields: 0,
        requiredFields: 0,
        rawIdentifierFields: 0,
      },
      warnings: [],
      analyzedAt: "2026-05-09T00:00:00.000Z",
      elapsedMs: 10,
    },
    activityLog: [
      {
        id: "activity-1",
        at: "2026-05-09T00:00:00.000Z",
        kind: "open",
        message: "Opened sample.pdf",
      },
    ],
    loadedAt: "2026-05-09T00:00:00.000Z",
  };
}
