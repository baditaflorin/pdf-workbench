import {
  FileArchive,
  FileDown,
  FileText,
  RefreshCcw,
  RotateCw,
  ScanText,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { downloadBlob, downloadText } from "../../lib/download";
import { errorMessage } from "../../lib/errors";
import {
  listRecentProjects,
  saveRecentProject,
  type RecentProject,
} from "../../lib/storage";
import { buildHtml, buildMarkdown, buildPlainText } from "./conversion";
import {
  deletePage,
  movePage,
  restorePages,
  rotatePage,
  selectedOrFirstVisible,
  visiblePages,
} from "./pdfState";
import { PagePreview } from "./PagePreview";
import { SignaturePad } from "./SignaturePad";
import type { PdfFormField, PdfProject } from "./types";

type BusyState = string | null;

export function PdfWorkbench() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [project, setProject] = useState<PdfProject | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [busy, setBusy] = useState<BusyState>(null);
  const [notice, setNotice] = useState(
    "Open a PDF to start. Files stay in this browser session.",
  );
  const [error, setError] = useState<string | null>(null);
  const [textStamp, setTextStamp] = useState({
    text: "Approved",
    x: 72,
    y: 72,
    fontSize: 14,
    color: "#146c74",
  });
  const [signature, setSignature] = useState({
    signer: "",
    x: 72,
    y: 72,
    width: 190,
    height: 64,
  });
  const [signatureImage, setSignatureImage] = useState<string | undefined>();
  const [aiSummary, setAiSummary] = useState("");

  const selectedPage = useMemo(
    () =>
      project ? selectedOrFirstVisible(project.pages, selectedPageId) : null,
    [project, selectedPageId],
  );
  const activePages = project ? visiblePages(project.pages) : [];
  const allText = project
    ? buildPlainText(project.embeddedText, project.ocrResults)
    : "";

  useEffect(() => {
    listRecentProjects()
      .then(setRecentProjects)
      .catch(() => setRecentProjects([]));
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setBusy("Opening PDF...");
    setError(null);
    setAiSummary("");

    try {
      const { loadPdfFile } = await import("./pdfDocument");
      const loaded = await loadPdfFile(file);
      setProject(loaded);
      setSelectedPageId(loaded.pages[0]?.id ?? null);
      setNotice(
        `Opened ${loaded.fileName}. ${loaded.pages.length} page(s), ${loaded.fields.length} form field(s).`,
      );
      await rememberProject(loaded);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  function updateProject(updater: (project: PdfProject) => PdfProject) {
    setProject((current) => (current ? updater(current) : current));
  }

  async function rememberProject(nextProject: PdfProject) {
    const record = {
      id: nextProject.id,
      fileName: nextProject.fileName,
      pageCount: nextProject.pages.length,
      updatedAt: new Date().toISOString(),
      ocrPages: nextProject.ocrResults.length,
    };

    await saveRecentProject(record);
    setRecentProjects((current) =>
      [record, ...current.filter((item) => item.id !== record.id)].slice(0, 6),
    );
  }

  function updateField(name: string, patch: Partial<PdfFormField>) {
    updateProject((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.name === name ? { ...field, ...patch } : field,
      ),
    }));
  }

  function addTextStamp() {
    if (!selectedPage || !textStamp.text.trim()) {
      return;
    }

    updateProject((current) => ({
      ...current,
      textStamps: [
        ...current.textStamps,
        {
          ...textStamp,
          id: crypto.randomUUID(),
          pageId: selectedPage.id,
          text: textStamp.text.trim(),
        },
      ],
    }));
    setNotice(
      `Text stamp queued for ${selectedPage.label}. Export to write it into the PDF.`,
    );
  }

  function addSignature() {
    if (!selectedPage || (!signature.signer.trim() && !signatureImage)) {
      setError("Type a signer name or draw a signature first.");
      return;
    }

    updateProject((current) => ({
      ...current,
      signatureStamps: [
        ...current.signatureStamps,
        {
          ...signature,
          id: crypto.randomUUID(),
          pageId: selectedPage.id,
          signer: signature.signer.trim() || "Signed",
          imageDataUrl: signatureImage,
        },
      ],
    }));
    setNotice(`Signature appearance queued for ${selectedPage.label}.`);
  }

  async function extractText() {
    if (!project) {
      return;
    }

    setBusy("Extracting embedded text...");
    setError(null);

    try {
      const { extractEmbeddedText } = await import("./pdfRenderer");
      const embeddedText = await extractEmbeddedText(project.bytes);
      const nextProject = { ...project, embeddedText };
      setProject(nextProject);
      setNotice(
        embeddedText
          ? "Embedded text extracted."
          : "No embedded text found; OCR can still read rendered pages.",
      );
      await rememberProject(nextProject);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function runOcr() {
    if (!project || !selectedPage) {
      return;
    }

    setBusy("Preparing OCR...");
    setError(null);

    try {
      const { runOcrOnPage } = await import("./ocr");
      const result = await runOcrOnPage(
        project.bytes,
        selectedPage.sourceIndex,
        setBusy,
      );
      const nextProject = {
        ...project,
        ocrResults: [
          ...project.ocrResults,
          {
            pageLabel: selectedPage.label,
            text: result.text,
            confidence: result.confidence,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      setProject(nextProject);
      setNotice(
        `OCR finished for ${selectedPage.label} with ${result.confidence}% confidence.`,
      );
      await rememberProject(nextProject);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function summarizeText() {
    if (!allText.trim()) {
      setError("Extract or OCR text before using local AI.");
      return;
    }

    setBusy("Asking the browser-local model...");
    setError(null);
    setAiSummary("");

    try {
      const { summarizeWithLocalModel } = await import("./localAi");
      setAiSummary(await summarizeWithLocalModel(allText));
      setNotice("Local AI summary generated in the browser.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function exportEditedPdf() {
    if (!project) {
      return;
    }

    setBusy("Exporting edited PDF...");
    setError(null);

    try {
      const { exportPdf } = await import("./pdfDocument");
      const blob = await exportPdf(project);
      downloadBlob(blob, `${baseName(project.fileName)}-workbench.pdf`);
      setNotice("Edited PDF exported.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  function downloadExport(kind: "txt" | "md" | "html") {
    if (!project) {
      return;
    }

    if (kind === "txt") {
      downloadText(
        buildPlainText(project.embeddedText, project.ocrResults),
        `${baseName(project.fileName)}.txt`,
      );
    } else if (kind === "md") {
      downloadText(
        buildMarkdown(
          project.fileName,
          project.embeddedText,
          project.ocrResults,
        ),
        `${baseName(project.fileName)}.md`,
        "text/markdown",
      );
    } else {
      downloadText(
        buildHtml(project.fileName, project.embeddedText, project.ocrResults),
        `${baseName(project.fileName)}.html`,
        "text/html",
      );
    }
  }

  return (
    <section className="workbench" aria-label="PDF Workbench">
      <aside className="side-panel">
        <div className="panel-section">
          <p className="panel-kicker">Document</p>
          <input
            ref={fileInputRef}
            data-testid="pdf-input"
            type="file"
            accept="application/pdf"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            className="primary-button"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileArchive aria-hidden="true" />
            Open PDF
          </button>
          {project ? (
            <dl className="document-facts">
              <div>
                <dt>File</dt>
                <dd>{project.fileName}</dd>
              </div>
              <div>
                <dt>Pages</dt>
                <dd>
                  {activePages.length}/{project.pages.length}
                </dd>
              </div>
              <div>
                <dt>Queued edits</dt>
                <dd>
                  {project.textStamps.length + project.signatureStamps.length}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div className="panel-section">
          <div className="section-heading">
            <p className="panel-kicker">Pages</p>
            <button
              type="button"
              className="icon-button"
              onClick={() =>
                updateProject((p) => ({ ...p, pages: restorePages(p.pages) }))
              }
            >
              <RefreshCcw aria-hidden="true" />
              <span>Restore</span>
            </button>
          </div>
          <div className="page-list" aria-label="PDF pages">
            {project ? (
              project.pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className={
                    page.id === selectedPage?.id
                      ? "page-row active"
                      : "page-row"
                  }
                  data-deleted={page.deleted}
                  onClick={() => {
                    if (!page.deleted) {
                      setSelectedPageId(page.id);
                    }
                  }}
                >
                  <span>{page.label}</span>
                  <span>
                    {page.deleted
                      ? "Deleted"
                      : `${Math.round(page.width)}x${Math.round(page.height)}`}
                  </span>
                </button>
              ))
            ) : (
              <p className="muted">Open a PDF to list pages.</p>
            )}
          </div>
        </div>

        <div className="panel-section">
          <p className="panel-kicker">Recent</p>
          {recentProjects.length ? (
            <ul className="recent-list">
              {recentProjects.map((item) => (
                <li key={item.id}>
                  <span>{item.fileName}</span>
                  <small>
                    {item.pageCount} pages · {item.ocrPages} OCR
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No local project history yet.</p>
          )}
        </div>
      </aside>

      <section className="preview-panel">
        <div className="status-row" role="status" aria-live="polite">
          <span>{busy ?? notice}</span>
          {error ? <strong>{error}</strong> : null}
        </div>

        {project && selectedPage ? (
          <>
            <div className="page-toolbar">
              <div>
                <p className="panel-kicker">Preview</p>
                <h1>{selectedPage.label}</h1>
              </div>
              <div className="toolbar-actions">
                <button
                  type="button"
                  onClick={() =>
                    updateProject((p) => ({
                      ...p,
                      pages: movePage(p.pages, selectedPage.id, -1),
                    }))
                  }
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateProject((p) => ({
                      ...p,
                      pages: movePage(p.pages, selectedPage.id, 1),
                    }))
                  }
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateProject((p) => ({
                      ...p,
                      pages: rotatePage(p.pages, selectedPage.id),
                    }))
                  }
                >
                  <RotateCw aria-hidden="true" />
                  Rotate
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => {
                    const nextPages = deletePage(
                      project.pages,
                      selectedPage.id,
                    );
                    updateProject((p) => ({ ...p, pages: nextPages }));
                    setSelectedPageId(
                      selectedOrFirstVisible(nextPages, selectedPage.id)?.id ??
                        null,
                    );
                  }}
                >
                  <Trash2 aria-hidden="true" />
                  Delete
                </button>
              </div>
            </div>
            <PagePreview
              bytes={project.bytes}
              pageIndex={selectedPage.sourceIndex}
              refreshKey={`${selectedPage.id}-${selectedPage.rotation}-${project.loadedAt}`}
            />
            <div className="edit-badges">
              <span>{selectedPage.rotation}° rotation queued</span>
              <span>
                {
                  project.textStamps.filter(
                    (stamp) => stamp.pageId === selectedPage.id,
                  ).length
                }{" "}
                text stamps
              </span>
              <span>
                {
                  project.signatureStamps.filter(
                    (stamp) => stamp.pageId === selectedPage.id,
                  ).length
                }{" "}
                signatures
              </span>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <FileText aria-hidden="true" />
            <h1>Open a PDF and work locally.</h1>
            <p>
              Reorder pages, delete pages, fill forms, add text, place a
              signature appearance, OCR scanned pages, and export without
              uploading the document.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Open first PDF
            </button>
          </div>
        )}
      </section>

      <aside className="tool-panel">
        <ToolSection title="Export">
          <button
            type="button"
            className="primary-button"
            disabled={!project || Boolean(busy)}
            onClick={exportEditedPdf}
          >
            <FileDown aria-hidden="true" />
            Export edited PDF
          </button>
          <div className="button-grid">
            <button
              type="button"
              disabled={!project || !allText}
              onClick={() => downloadExport("txt")}
            >
              TXT
            </button>
            <button
              type="button"
              disabled={!project || !allText}
              onClick={() => downloadExport("md")}
            >
              Markdown
            </button>
            <button
              type="button"
              disabled={!project || !allText}
              onClick={() => downloadExport("html")}
            >
              HTML
            </button>
          </div>
        </ToolSection>

        <ToolSection title="Text Stamp">
          <label>
            Text
            <textarea
              value={textStamp.text}
              onChange={(event) =>
                setTextStamp({ ...textStamp, text: event.target.value })
              }
            />
          </label>
          <CoordinateGrid>
            <NumberInput
              label="X"
              value={textStamp.x}
              onChange={(x) => setTextStamp({ ...textStamp, x })}
            />
            <NumberInput
              label="Y"
              value={textStamp.y}
              onChange={(y) => setTextStamp({ ...textStamp, y })}
            />
            <NumberInput
              label="Size"
              value={textStamp.fontSize}
              onChange={(fontSize) => setTextStamp({ ...textStamp, fontSize })}
            />
            <label>
              Color
              <input
                type="color"
                value={textStamp.color}
                onChange={(event) =>
                  setTextStamp({ ...textStamp, color: event.target.value })
                }
              />
            </label>
          </CoordinateGrid>
          <button
            type="button"
            disabled={!project || !selectedPage}
            onClick={addTextStamp}
          >
            Add text to page
          </button>
        </ToolSection>

        <ToolSection title="Forms">
          {project?.fields.length ? (
            <div className="form-field-list">
              {project.fields.map((field) => (
                <label key={field.name}>
                  {field.name}
                  {field.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={Boolean(field.checked)}
                      onChange={(event) =>
                        updateField(field.name, {
                          checked: event.target.checked,
                          value: String(event.target.checked),
                        })
                      }
                    />
                  ) : field.options?.length ? (
                    <select
                      value={field.value}
                      onChange={(event) =>
                        updateField(field.name, { value: event.target.value })
                      }
                    >
                      <option value="">Choose...</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={field.value}
                      onChange={(event) =>
                        updateField(field.name, { value: event.target.value })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          ) : (
            <p className="muted">
              No AcroForm fields detected in the open PDF.
            </p>
          )}
        </ToolSection>

        <ToolSection title="Signature Appearance">
          <label>
            Signer name
            <input
              value={signature.signer}
              onChange={(event) =>
                setSignature({ ...signature, signer: event.target.value })
              }
            />
          </label>
          <CoordinateGrid>
            <NumberInput
              label="X"
              value={signature.x}
              onChange={(x) => setSignature({ ...signature, x })}
            />
            <NumberInput
              label="Y"
              value={signature.y}
              onChange={(y) => setSignature({ ...signature, y })}
            />
            <NumberInput
              label="Width"
              value={signature.width}
              onChange={(width) => setSignature({ ...signature, width })}
            />
            <NumberInput
              label="Height"
              value={signature.height}
              onChange={(height) => setSignature({ ...signature, height })}
            />
          </CoordinateGrid>
          <SignaturePad onChange={setSignatureImage} />
          <p className="fine-print">
            V1 creates a visible signature appearance, not a certified
            cryptographic signature.
          </p>
          <button
            type="button"
            disabled={!project || !selectedPage}
            onClick={addSignature}
          >
            Add signature to page
          </button>
        </ToolSection>

        <ToolSection title="OCR and Local AI">
          <div className="button-grid">
            <button
              type="button"
              disabled={!project || Boolean(busy)}
              onClick={extractText}
            >
              <FileText aria-hidden="true" />
              Extract text
            </button>
            <button
              type="button"
              disabled={!project || !selectedPage || Boolean(busy)}
              onClick={runOcr}
            >
              <ScanText aria-hidden="true" />
              OCR page
            </button>
          </div>
          {project?.ocrResults.length ? (
            <div className="ocr-results">
              {project.ocrResults.map((result) => (
                <article key={`${result.pageLabel}-${result.createdAt}`}>
                  <strong>
                    {result.pageLabel} · {result.confidence}%
                  </strong>
                  <p>{result.text || "No text recognized."}</p>
                </article>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            disabled={!allText || Boolean(busy)}
            onClick={summarizeText}
          >
            <Sparkles aria-hidden="true" />
            Summarize with local model
          </button>
          {aiSummary ? <pre className="ai-summary">{aiSummary}</pre> : null}
        </ToolSection>
      </aside>
    </section>
  );
}

function ToolSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="tool-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function CoordinateGrid({ children }: { children: ReactNode }) {
  return <div className="coordinate-grid">{children}</div>;
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        value={value}
        min={0}
        step={1}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function baseName(fileName: string) {
  return fileName.replace(/\.pdf$/i, "");
}
