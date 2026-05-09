import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  FileArchive,
  FileDown,
  FileText,
  Info,
  RefreshCcw,
  RotateCw,
  ScanText,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { downloadBlob, downloadText } from "../../lib/download";
import {
  listRecentProjects,
  saveRecentProject,
  type RecentProject,
} from "../../lib/storage";
import {
  buildExportMetadata,
  buildHtml,
  buildMarkdown,
  buildPlainText,
} from "./conversion";
import { fieldLabel, validateField } from "./formIntelligence";
import {
  buildPdfIntelligence,
  confidenceBand,
  explainPdfError,
  fieldConfidenceBand,
} from "./pdfIntelligence";
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
import type {
  ActivityLogEntry,
  PdfFormField,
  PdfProject,
  PdfUserError,
} from "./types";

type OperationState = {
  id: string;
  label: string;
  cancellable: boolean;
  startedAt: number;
};

const pageListLimit = 80;

export function PdfWorkbench() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const operationRef = useRef<OperationState | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [project, setProject] = useState<PdfProject | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [operation, setOperation] = useState<OperationState | null>(null);
  const [notice, setNotice] = useState(
    "Open a PDF to start. Files stay in this browser session.",
  );
  const [error, setError] = useState<PdfUserError | null>(null);
  const [showAllPages, setShowAllPages] = useState(false);
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
  const debugEnabled = useMemo(
    () => new URLSearchParams(window.location.search).get("debug") === "1",
    [],
  );

  const selectedPage = useMemo(
    () =>
      project ? selectedOrFirstVisible(project.pages, selectedPageId) : null,
    [project, selectedPageId],
  );
  const activePages = project ? visiblePages(project.pages) : [];
  const pagesToList =
    project && !showAllPages && project.pages.length > pageListLimit
      ? project.pages.slice(0, pageListLimit)
      : project?.pages;
  const busy = operation?.label ?? null;
  const allText = project
    ? buildPlainText(project.embeddedText, project.ocrResults)
    : "";

  useEffect(() => {
    listRecentProjects()
      .then(setRecentProjects)
      .catch(() => setRecentProjects([]));
  }, []);

  function beginOperation(label: string, cancellable = false) {
    const controller = new AbortController();
    const nextOperation = {
      id: crypto.randomUUID(),
      label,
      cancellable,
      startedAt: performance.now(),
    };

    operationRef.current = nextOperation;
    abortRef.current = controller;
    setOperation(nextOperation);

    return {
      ...nextOperation,
      signal: controller.signal,
      update: (nextLabel: string) => {
        setOperation((current) =>
          current?.id === nextOperation.id
            ? { ...current, label: nextLabel }
            : current,
        );
      },
    };
  }

  function finishOperation(operationId: string) {
    if (operationRef.current?.id === operationId) {
      operationRef.current = null;
      abortRef.current = null;
      setOperation(null);
    }
  }

  function isCurrentOperation(operationId: string) {
    return operationRef.current?.id === operationId;
  }

  function cancelOperation() {
    abortRef.current?.abort();
    appendActivity("cancel", "Cancelled the running operation");
    setNotice("Operation cancelled. Your document is unchanged.");
    finishOperation(operationRef.current?.id ?? "");
  }

  function appendActivity(
    kind: ActivityLogEntry["kind"],
    message: string,
    detail?: string,
  ) {
    const entry = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      kind,
      message,
      detail,
    };

    setProject((current) =>
      current
        ? {
            ...current,
            activityLog: [...current.activityLog, entry].slice(-40),
          }
        : current,
    );
  }

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const op = beginOperation("Opening PDF...");
    setError(null);
    setAiSummary("");
    setShowAllPages(false);

    try {
      const { loadPdfFile } = await import("./pdfDocument");
      const loaded = await loadPdfFile(file);
      op.update("Analyzing document shape...");
      const { extractTextSample } = await import("./pdfRenderer");
      let textSample = "";
      let pagesSampled = 0;

      try {
        const sample = await extractTextSample(loaded.bytes, 3, {
          signal: op.signal,
        });
        textSample = sample.text;
        pagesSampled = sample.pagesSampled;
      } catch (sampleError) {
        if (op.signal.aborted) {
          throw sampleError;
        }
      }

      const intelligence = buildPdfIntelligence({
        fileName: loaded.fileName,
        sizeBytes: loaded.sizeBytes,
        pageCount: loaded.pages.length,
        sourceId: loaded.sourceId,
        fields: loaded.fields,
        sampleText: textSample,
        pagesSampled,
        elapsedMs: Math.round(performance.now() - op.startedAt),
        analyzedAt: loaded.loadedAt,
      });
      const analyzedProject = {
        ...loaded,
        intelligence,
        activityLog: [
          ...loaded.activityLog,
          {
            id: `${loaded.sourceId}-analyze`,
            at: new Date().toISOString(),
            kind: "analyze" as const,
            message: intelligence.summary,
          },
        ],
      };

      if (!isCurrentOperation(op.id)) {
        return;
      }

      setProject(analyzedProject);
      setSelectedPageId(analyzedProject.pages[0]?.id ?? null);
      setNotice(`Opened ${loaded.fileName}. ${intelligence.summary}`);
      await rememberProject(analyzedProject);
    } catch (err) {
      const friendly = explainPdfError(err);
      setError(friendly);
      setNotice(friendly.what);
    } finally {
      finishOperation(op.id);
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
        field.name === name ? updateFieldWithValidation(field, patch) : field,
      ),
    }));
  }

  function updateFieldWithValidation(
    field: PdfFormField,
    patch: Partial<PdfFormField>,
  ) {
    const nextField = { ...field, ...patch };

    if (!nextField.intelligence) {
      return nextField;
    }

    return {
      ...nextField,
      intelligence: {
        ...nextField.intelligence,
        warnings: validateField(nextField, nextField.intelligence),
      },
    };
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
      activityLog: [
        ...current.activityLog,
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          kind: "edit" as const,
          message: `Queued text stamp on ${selectedPage.label}`,
          detail: textStamp.text.trim(),
        },
      ].slice(-40),
    }));
    setNotice(
      `Text stamp queued for ${selectedPage.label}. Export to write it into the PDF.`,
    );
  }

  function addSignature() {
    if (!selectedPage || (!signature.signer.trim() && !signatureImage)) {
      setError({
        kind: "unsupported_pdf",
        title: "Signature needs a visible appearance",
        what: "There is no signer name or drawn signature to place on the page.",
        why: "V1 creates visible signature appearances, so it needs something visible to write.",
        nextStep: "Type a signer name or draw a signature, then add it again.",
        recoverable: true,
      });
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
      activityLog: [
        ...current.activityLog,
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          kind: "edit" as const,
          message: `Queued signature appearance on ${selectedPage.label}`,
          detail: signature.signer.trim() || "Drawn signature",
        },
      ].slice(-40),
    }));
    setNotice(`Signature appearance queued for ${selectedPage.label}.`);
  }

  async function extractText() {
    if (!project) {
      return;
    }

    const op = beginOperation("Extracting embedded text...", true);
    setError(null);

    try {
      const { extractEmbeddedText } = await import("./pdfRenderer");
      const embeddedText = await extractEmbeddedText(project.bytes, undefined, {
        signal: op.signal,
        onProgress: op.update,
      });
      const intelligence = buildPdfIntelligence({
        fileName: project.fileName,
        sizeBytes: project.sizeBytes,
        pageCount: project.pages.length,
        sourceId: project.sourceId,
        fields: project.fields,
        sampleText: embeddedText,
        pagesSampled: project.pages.length,
        elapsedMs: Math.round(performance.now() - op.startedAt),
        analyzedAt: project.loadedAt,
      });
      const nextProject = {
        ...project,
        embeddedText,
        intelligence,
        activityLog: [
          ...project.activityLog,
          {
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            kind: "extract_text" as const,
            message: embeddedText
              ? "Extracted embedded text"
              : "No embedded text found",
            detail: `${embeddedText.length} character(s)`,
          },
        ].slice(-40),
      };

      if (!isCurrentOperation(op.id)) {
        return;
      }

      setProject(nextProject);
      setNotice(
        embeddedText
          ? "Embedded text extracted."
          : "No embedded text found; OCR can still read rendered pages.",
      );
      await rememberProject(nextProject);
    } catch (err) {
      const friendly = explainPdfError(err);
      setError(friendly);
      setNotice(friendly.what);
    } finally {
      finishOperation(op.id);
    }
  }

  async function runOcr() {
    if (!project || !selectedPage) {
      return;
    }

    const op = beginOperation("Preparing OCR...", true);
    setError(null);

    try {
      const { runOcrOnPage } = await import("./ocr");
      const result = await runOcrOnPage(
        project.bytes,
        selectedPage.sourceIndex,
        op.update,
        op.signal,
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
            engine: "tesseract.js",
            language: "eng",
            source: "ocr" as const,
          },
        ],
        activityLog: [
          ...project.activityLog,
          {
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            kind: "ocr" as const,
            message: `OCR finished for ${selectedPage.label}`,
            detail: `${result.confidence}% confidence`,
          },
        ].slice(-40),
      };

      if (!isCurrentOperation(op.id)) {
        return;
      }

      setProject(nextProject);
      setNotice(
        `OCR finished for ${selectedPage.label} with ${result.confidence}% confidence.`,
      );
      await rememberProject(nextProject);
    } catch (err) {
      const friendly = explainPdfError(err);
      setError(friendly);
      setNotice(friendly.what);
    } finally {
      finishOperation(op.id);
    }
  }

  async function summarizeText() {
    if (!allText.trim()) {
      setError({
        kind: "unsupported_pdf",
        title: "No text is ready for local AI",
        what: "The current project does not have extracted or OCR text yet.",
        why: "The browser-local model needs text, not raw PDF pages.",
        nextStep: "Extract embedded text or run OCR on scanned pages first.",
        recoverable: true,
      });
      return;
    }

    const op = beginOperation("Asking the browser-local model...");
    setError(null);
    setAiSummary("");

    try {
      const { summarizeWithLocalModel } = await import("./localAi");
      setAiSummary(await summarizeWithLocalModel(allText));
      setNotice("Local AI summary generated in the browser.");
    } catch (err) {
      const friendly = explainPdfError(err);
      setError(friendly);
      setNotice(friendly.what);
    } finally {
      finishOperation(op.id);
    }
  }

  async function exportEditedPdf() {
    if (!project) {
      return;
    }

    const op = beginOperation("Exporting edited PDF...");
    setError(null);

    try {
      const { exportPdf } = await import("./pdfDocument");
      const blob = await exportPdf(project);
      downloadBlob(blob, `${baseName(project.fileName)}-workbench.pdf`);
      appendActivity("export", "Exported edited PDF", project.fileName);
      setNotice("Edited PDF exported.");
    } catch (err) {
      const friendly = explainPdfError(err);
      setError(friendly);
      setNotice(friendly.what);
    } finally {
      finishOperation(op.id);
    }
  }

  function downloadExport(kind: "txt" | "md" | "html") {
    if (!project) {
      return;
    }

    const metadata = buildExportMetadata(
      project.fileName,
      project.intelligence,
      __APP_VERSION__,
      __COMMIT_SHA__,
    );

    if (kind === "txt") {
      downloadText(
        buildPlainText(project.embeddedText, project.ocrResults, metadata),
        `${baseName(project.fileName)}.txt`,
      );
    } else if (kind === "md") {
      downloadText(
        buildMarkdown(
          project.fileName,
          project.embeddedText,
          project.ocrResults,
          metadata,
        ),
        `${baseName(project.fileName)}.md`,
        "text/markdown",
      );
    } else {
      downloadText(
        buildHtml(
          project.fileName,
          project.embeddedText,
          project.ocrResults,
          metadata,
        ),
        `${baseName(project.fileName)}.html`,
        "text/html",
      );
    }
    appendActivity("export", `Downloaded ${kind.toUpperCase()} text export`);
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

        {project ? (
          <div className="panel-section">
            <IntelligencePanel project={project} />
          </div>
        ) : null}

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
            {project && pagesToList ? (
              <>
                {project.pages.length > pageListLimit ? (
                  <div className="large-doc-note">
                    <Info aria-hidden="true" />
                    <span>
                      Showing {pagesToList.length}/{project.pages.length} pages
                      by default.
                    </span>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setShowAllPages((value) => !value)}
                    >
                      {showAllPages ? "Show fewer" : "Show all"}
                    </button>
                  </div>
                ) : null}
                {pagesToList.map((page) => (
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
                ))}
              </>
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
          <div className="status-actions">
            {operation?.cancellable ? (
              <button
                type="button"
                className="ghost-button"
                onClick={cancelOperation}
              >
                <X aria-hidden="true" />
                Cancel
              </button>
            ) : null}
            {error ? <strong>{error.title}</strong> : null}
          </div>
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
          <EmptyOrErrorState
            error={error}
            onOpen={() => fileInputRef.current?.click()}
            debugEnabled={debugEnabled}
          />
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
                  <span className="field-heading">
                    <span>{fieldLabel(field)}</span>
                    <ConfidencePill
                      confidence={field.intelligence?.confidence ?? 35}
                    />
                  </span>
                  {field.intelligence ? (
                    <span className="field-meta">
                      {field.intelligence.section} ·{" "}
                      {field.intelligence.inferredType.replace(/_/g, " ")}
                      {field.intelligence.required ? " · required" : ""}
                    </span>
                  ) : null}
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
                  <FieldWarnings field={field} />
                  {debugEnabled ? (
                    <code className="debug-code">{field.name}</code>
                  ) : null}
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
                    {result.confidence < 70 ? " · verify" : ""}
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

        {project ? (
          <ToolSection title="Activity">
            <ActivityLog entries={project.activityLog} />
          </ToolSection>
        ) : null}

        {project && debugEnabled ? (
          <ToolSection title="Debug">
            <DebugPanel project={project} />
          </ToolSection>
        ) : null}
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

function IntelligencePanel({ project }: { project: PdfProject }) {
  const { intelligence } = project;

  return (
    <div className="intelligence-panel">
      <div className="section-heading">
        <p className="panel-kicker">Document intelligence</p>
        <ConfidencePill confidence={intelligence.shape.confidence} />
      </div>
      <h2>{intelligence.shape.label}</h2>
      <p>{intelligence.summary}</p>
      <div className="condition-list">
        {intelligence.conditions.map((condition) => (
          <article key={condition.id}>
            <span>
              <CheckCircle2 aria-hidden="true" />
              {condition.label}
            </span>
            <ConfidencePill confidence={condition.confidence} />
            <small>{condition.reason}</small>
          </article>
        ))}
      </div>
      {intelligence.warnings.length ? (
        <div className="warning-list">
          {intelligence.warnings.map((warning) => (
            <article key={warning.id}>
              <strong>
                <AlertTriangle aria-hidden="true" />
                {warning.label}
              </strong>
              <p>{warning.reason}</p>
              <small>{warning.nextStep}</small>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EmptyOrErrorState({
  error,
  onOpen,
  debugEnabled,
}: {
  error: PdfUserError | null;
  onOpen: () => void;
  debugEnabled: boolean;
}) {
  if (error) {
    return (
      <div className="empty-state error-state">
        <AlertTriangle aria-hidden="true" />
        <h1>{error.title}</h1>
        <p>{error.what}</p>
        <div className="error-details">
          <strong>Why</strong>
          <p>{error.why}</p>
          <strong>Next step</strong>
          <p>{error.nextStep}</p>
          {debugEnabled && error.technicalDetail ? (
            <>
              <strong>Technical detail</strong>
              <code>{error.technicalDetail}</code>
            </>
          ) : null}
        </div>
        <button type="button" className="primary-button" onClick={onOpen}>
          Open another PDF
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <FileText aria-hidden="true" />
      <h1>Open a PDF and work locally.</h1>
      <p>
        Reorder pages, delete pages, fill forms, add text, place a signature
        appearance, OCR scanned pages, and export without uploading the
        document.
      </p>
      <button type="button" className="primary-button" onClick={onOpen}>
        Open first PDF
      </button>
    </div>
  );
}

function ConfidencePill({ confidence }: { confidence: number }) {
  const band = confidenceBand(confidence);

  return (
    <span className="confidence-pill" data-band={band}>
      {band} · {confidence}%
    </span>
  );
}

function FieldWarnings({ field }: { field: PdfFormField }) {
  const warnings = field.intelligence?.warnings ?? [];

  if (!warnings.length) {
    return null;
  }

  return (
    <span className="field-warnings">
      {warnings.map((warning) => (
        <small key={warning.id}>
          <AlertTriangle aria-hidden="true" />
          {warning.message}
        </small>
      ))}
    </span>
  );
}

function ActivityLog({ entries }: { entries: ActivityLogEntry[] }) {
  if (!entries.length) {
    return <p className="muted">No project activity yet.</p>;
  }

  return (
    <ol className="activity-log">
      {entries.slice(-8).map((entry) => (
        <li key={entry.id}>
          <span>{entry.message}</span>
          <small>
            {new Date(entry.at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {entry.detail ? ` · ${entry.detail}` : ""}
          </small>
        </li>
      ))}
    </ol>
  );
}

function DebugPanel({ project }: { project: PdfProject }) {
  return (
    <div className="debug-panel">
      <div>
        <Brain aria-hidden="true" />
        <span>Debug mode is enabled with ?debug=1.</span>
      </div>
      <pre>
        {JSON.stringify(
          {
            sourceId: project.sourceId,
            intelligence: project.intelligence,
            fields: project.fields.map((field) => ({
              rawName: field.name,
              label: fieldLabel(field),
              band: fieldConfidenceBand(field.intelligence),
              warnings: field.intelligence?.warnings,
            })),
          },
          null,
          2,
        )}
      </pre>
    </div>
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
