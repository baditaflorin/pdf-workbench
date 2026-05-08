import {
  degrees,
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
  rgb,
  StandardFonts,
} from "pdf-lib";
import type { PDFFont, PDFPage } from "pdf-lib";
import { createPageStates, visiblePages } from "./pdfState";
import type {
  PdfFormField,
  PdfProject,
  SignatureStamp,
  TextStamp,
} from "./types";

export async function loadPdfFile(file: File): Promise<PdfProject> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();

  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    bytes,
    pages: createPageStates(
      pages.map((page) => ({
        ...page.getSize(),
        rotation: page.getRotation().angle,
      })),
    ),
    fields: readFormFields(doc),
    textStamps: [],
    signatureStamps: [],
    ocrResults: [],
    embeddedText: "",
    loadedAt: new Date().toISOString(),
  };
}

export async function exportPdf(project: PdfProject) {
  const source = await PDFDocument.load(copyBytes(project.bytes));
  applyFormFields(source, project.fields);

  const form = source.getForm();
  if (form.getFields().length > 0) {
    form.flatten({ updateFieldAppearances: true });
  }

  const output = await PDFDocument.create();
  const pagesToExport = visiblePages(project.pages);
  const font = await output.embedFont(StandardFonts.Helvetica);
  const signatureFont = await output.embedFont(StandardFonts.HelveticaOblique);

  for (const pageState of pagesToExport) {
    const [page] = await output.copyPages(source, [pageState.sourceIndex]);
    page.setRotation(degrees(pageState.rotation));
    drawTextStamps(
      page,
      project.textStamps.filter((stamp) => stamp.pageId === pageState.id),
      font,
    );
    await drawSignatureStamps(
      output,
      page,
      project.signatureStamps.filter((stamp) => stamp.pageId === pageState.id),
      signatureFont,
    );
    output.addPage(page);
  }

  const saved = await output.save();
  const arrayBuffer = new ArrayBuffer(saved.byteLength);
  new Uint8Array(arrayBuffer).set(saved);
  return new Blob([arrayBuffer], { type: "application/pdf" });
}

function readFormFields(doc: PDFDocument): PdfFormField[] {
  try {
    return doc
      .getForm()
      .getFields()
      .map((field) => {
        if (field instanceof PDFTextField) {
          return {
            name: field.getName(),
            type: "text",
            value: field.getText() ?? "",
          };
        }

        if (field instanceof PDFCheckBox) {
          return {
            name: field.getName(),
            type: "checkbox",
            value: field.isChecked() ? "true" : "false",
            checked: field.isChecked(),
          };
        }

        if (field instanceof PDFDropdown) {
          return {
            name: field.getName(),
            type: "choice",
            value: field.getSelected()[0] ?? "",
            options: field.getOptions(),
          };
        }

        if (field instanceof PDFOptionList) {
          return {
            name: field.getName(),
            type: "choice",
            value: field.getSelected()[0] ?? "",
            options: field.getOptions(),
          };
        }

        if (field instanceof PDFRadioGroup) {
          return {
            name: field.getName(),
            type: "choice",
            value: field.getSelected() ?? "",
            options: field.getOptions(),
          };
        }

        return { name: field.getName(), type: "unknown", value: "" };
      });
  } catch {
    return [];
  }
}

function applyFormFields(doc: PDFDocument, fields: PdfFormField[]) {
  if (fields.length === 0) {
    return;
  }

  const form = doc.getForm();
  for (const field of fields) {
    try {
      if (field.type === "text") {
        form.getTextField(field.name).setText(field.value);
      } else if (field.type === "checkbox") {
        const checkBox = form.getCheckBox(field.name);
        if (field.checked) {
          checkBox.check();
        } else {
          checkBox.uncheck();
        }
      } else if (field.type === "choice" && field.value) {
        selectChoice(form, field);
      }
    } catch {
      // Keep export resilient when a malformed field cannot be updated.
    }
  }
}

function selectChoice(
  form: ReturnType<PDFDocument["getForm"]>,
  field: PdfFormField,
) {
  try {
    form.getDropdown(field.name).select(field.value);
    return;
  } catch {
    // Try the next compatible field type.
  }

  try {
    form.getOptionList(field.name).select(field.value);
    return;
  } catch {
    // Try the next compatible field type.
  }

  form.getRadioGroup(field.name).select(field.value);
}

function drawTextStamps(page: PDFPage, stamps: TextStamp[], font: PDFFont) {
  for (const stamp of stamps) {
    const color = hexToRgb(stamp.color);
    page.drawText(stamp.text, {
      x: stamp.x,
      y: stamp.y,
      size: stamp.fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      maxWidth: Math.max(120, page.getWidth() - stamp.x - 36),
    });
  }
}

async function drawSignatureStamps(
  doc: PDFDocument,
  page: PDFPage,
  stamps: SignatureStamp[],
  font: PDFFont,
) {
  for (const stamp of stamps) {
    if (stamp.imageDataUrl) {
      const bytes = await dataUrlToBytes(stamp.imageDataUrl);
      const image = stamp.imageDataUrl.startsWith("data:image/jpeg")
        ? await doc.embedJpg(bytes)
        : await doc.embedPng(bytes);
      page.drawImage(image, {
        x: stamp.x,
        y: stamp.y,
        width: stamp.width,
        height: stamp.height,
      });
    } else {
      page.drawText(stamp.signer, {
        x: stamp.x,
        y: stamp.y,
        size: 24,
        font,
        color: rgb(0.08, 0.12, 0.2),
      });
    }

    page.drawLine({
      start: { x: stamp.x, y: stamp.y - 6 },
      end: { x: stamp.x + stamp.width, y: stamp.y - 6 },
      thickness: 1,
      color: rgb(0.08, 0.12, 0.2),
    });
  }
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const parsed = Number.parseInt(
    clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean,
    16,
  );

  return {
    r: ((parsed >> 16) & 255) / 255,
    g: ((parsed >> 8) & 255) / 255,
    b: (parsed & 255) / 255,
  };
}

async function dataUrlToBytes(dataUrl: string) {
  const response = await fetch(dataUrl);
  return new Uint8Array(await response.arrayBuffer());
}

function copyBytes(bytes: Uint8Array) {
  return bytes.slice().buffer;
}
