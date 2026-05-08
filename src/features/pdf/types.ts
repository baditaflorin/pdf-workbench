export type PdfFieldType = "text" | "checkbox" | "choice" | "unknown";

export type PdfFormField = {
  name: string;
  type: PdfFieldType;
  value: string;
  checked?: boolean;
  options?: string[];
};

export type PdfPageState = {
  id: string;
  sourceIndex: number;
  label: string;
  width: number;
  height: number;
  rotation: number;
  deleted: boolean;
};

export type TextStamp = {
  id: string;
  pageId: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
};

export type SignatureStamp = {
  id: string;
  pageId: string;
  signer: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageDataUrl?: string;
};

export type OcrResult = {
  pageLabel: string;
  text: string;
  confidence: number;
  createdAt: string;
};

export type PdfProject = {
  id: string;
  fileName: string;
  bytes: Uint8Array;
  pages: PdfPageState[];
  fields: PdfFormField[];
  textStamps: TextStamp[];
  signatureStamps: SignatureStamp[];
  ocrResults: OcrResult[];
  embeddedText: string;
  loadedAt: string;
};
