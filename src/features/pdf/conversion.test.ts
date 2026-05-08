import { describe, expect, it } from "vitest";
import { buildHtml, buildMarkdown, buildPlainText } from "./conversion";

describe("conversion helpers", () => {
  it("combines embedded and OCR text", () => {
    const text = buildPlainText("Embedded", [
      {
        pageLabel: "Page 1",
        text: "OCR text",
        confidence: 91,
        createdAt: "2026-05-08T00:00:00Z",
      },
    ]);

    expect(text).toContain("Embedded");
    expect(text).toContain("OCR text");
  });

  it("creates markdown sections", () => {
    expect(buildMarkdown("sample.pdf", "", [])).toBe("# sample.pdf");
  });

  it("escapes html output", () => {
    expect(buildHtml("<bad>.pdf", "<script>", [])).toContain("&lt;script&gt;");
  });
});
