/**
 * Helpers for handling file names safely:
 * - Vietnamese/diacritic names are stripped for on-disk storage keys so the
 *   filesystem never stores garbled or path-unsafe characters.
 * - Browser downloads use RFC 5987 `filename*=UTF-8''...` so Vietnamese file
 *   names display correctly in the browser's save dialog.
 */

/** Remove Vietnamese diacritics and unsafe characters from a file name. */
export function sanitizeFilename(name: string): string {
  const cleaned = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, 120)
    .trim();

  return cleaned || "file";
}

/** Build a RFC 5987 Content-Disposition value that preserves Vietnamese names. */
export function contentDisposition(filename: string): string {
  const asciiFallback = sanitizeFilename(filename);
  const encoded = encodeURIComponent(String(filename || "file")).replace(
    /['()*]/g,
    (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}