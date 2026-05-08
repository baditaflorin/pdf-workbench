import { expect, test } from "@playwright/test";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

test("loads the workbench and opens a PDF locally", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Open a PDF and work locally/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Star on GitHub/i }),
  ).toHaveAttribute("href", "https://github.com/baditaflorin/pdf-workbench");
  await expect(page.getByText(/Version/)).toBeVisible();

  await page.getByTestId("pdf-input").setInputFiles({
    name: "sample.pdf",
    mimeType: "application/pdf",
    buffer: await makeSamplePdf(),
  });

  await expect(page.getByText(/Opened sample.pdf/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Page 1" })).toBeVisible();
  await expect(page.getByLabel("Selected PDF page preview")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Export edited PDF/i }),
  ).toBeEnabled();
});

async function makeSamplePdf() {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("PDF Workbench smoke test", {
    x: 72,
    y: 720,
    size: 24,
    font,
    color: rgb(0.08, 0.25, 0.29),
  });

  return Buffer.from(await pdf.save());
}
