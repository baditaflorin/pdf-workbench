export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadText(
  text: string,
  fileName: string,
  type = "text/plain",
) {
  downloadBlob(new Blob([text], { type }), fileName);
}
