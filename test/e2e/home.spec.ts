import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

test("loads the workbench and opens a PDF locally", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("./");

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

  await expect(
    page.locator(".status-row").getByText(/Opened sample.pdf/i),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Page 1" })).toBeVisible();
  await expect(page.getByLabel("Selected PDF page preview")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Export edited PDF/i }),
  ).toBeEnabled();

  await page.getByRole("button", { name: "Sample" }).click();
  await expect(
    page.locator(".status-row").getByText(/pdf-workbench-sample.pdf/i),
  ).toBeVisible();

  const stateDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /^State$/ }).click();
  const downloadedState = await stateDownload;
  expect(downloadedState.suggestedFilename()).toMatch(/\.pdfwb\.json$/);

  await page.getByRole("button", { name: /Clear project/i }).click();
  await expect(
    page.getByRole("heading", { name: /Open a PDF and work locally/i }),
  ).toBeVisible();

  const statePath = await downloadedState.path();
  if (!statePath) {
    throw new Error("State download did not produce a local file.");
  }

  await page.getByTestId("pdf-input").setInputFiles({
    name: downloadedState.suggestedFilename(),
    mimeType: "application/json",
    buffer: await readFile(statePath),
  });
  await expect(
    page.locator(".status-row").getByText(/Project state restored/i),
  ).toBeVisible();
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
