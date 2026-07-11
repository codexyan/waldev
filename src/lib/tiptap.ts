/**
 * Renderer Tiptap JSON → HTML yang aman untuk runtime tanpa DOM (Cloudflare Workers).
 * Menghindari ketergantungan DOM: whitelist tag, escape teks, validasi protokol link.
 * Dipakai di server (server action) saat menyimpan artikel → hasil disimpan ke content_html.
 */

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export const EMPTY_DOC: TiptapNode = { type: "doc", content: [] };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  const value = href.trim();
  // Hanya izinkan protokol aman + path/anchor relatif.
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(value)) return value;
  return null;
}

function normalizeDoc(input: unknown): TiptapNode | null {
  let doc: unknown = input;
  if (typeof input === "string") {
    try {
      doc = JSON.parse(input);
    } catch {
      return null;
    }
  }
  if (doc && typeof doc === "object" && (doc as TiptapNode).type === "doc") {
    return doc as TiptapNode;
  }
  return null;
}

function rawText(node: TiptapNode): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(rawText).join("");
}

function renderTextNode(node: TiptapNode): string {
  let html = escapeHtml(node.text ?? "");
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
      case "strong":
        html = `<strong>${html}</strong>`;
        break;
      case "italic":
      case "em":
        html = `<em>${html}</em>`;
        break;
      case "strike":
        html = `<s>${html}</s>`;
        break;
      case "underline":
        html = `<u>${html}</u>`;
        break;
      case "code":
        html = `<code>${html}</code>`;
        break;
      case "link": {
        const href = safeHref(mark.attrs?.href);
        if (href) {
          html = `<a href="${escapeHtml(href)}" rel="noopener noreferrer nofollow" target="_blank">${html}</a>`;
        }
        break;
      }
      default:
        break;
    }
  }
  return html;
}

function renderChildren(node: TiptapNode): string {
  return (node.content ?? []).map(renderNode).join("");
}

function renderNode(node: TiptapNode): string {
  switch (node.type) {
    case "text":
      return renderTextNode(node);
    case "paragraph":
      return `<p>${renderChildren(node)}</p>`;
    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 2), 1), 6);
      return `<h${level}>${renderChildren(node)}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${renderChildren(node)}</ul>`;
    case "orderedList":
      return `<ol>${renderChildren(node)}</ol>`;
    case "listItem":
      return `<li>${renderChildren(node)}</li>`;
    case "blockquote":
      return `<blockquote>${renderChildren(node)}</blockquote>`;
    case "codeBlock":
      return `<pre><code>${escapeHtml(rawText(node))}</code></pre>`;
    case "horizontalRule":
      return "<hr />";
    case "hardBreak":
      return "<br />";
    case "doc":
      return renderChildren(node);
    default:
      // Node tak dikenal → render anak-anaknya (tetap aman karena semua di-escape).
      return renderChildren(node);
  }
}

/** Render dokumen Tiptap (objek atau string JSON) ke HTML tersanitasi. */
export function renderTiptapToHtml(input: unknown): string {
  const doc = normalizeDoc(input);
  return doc ? renderNode(doc) : "";
}

/** Ekstrak teks polos dari dokumen Tiptap (untuk reading time / excerpt). */
export function extractPlainText(input: unknown): string {
  const doc = normalizeDoc(input);
  if (!doc) return "";
  const collect = (node: TiptapNode): string => {
    if (node.type === "text") return node.text ?? "";
    const sep = node.type === "paragraph" || node.type === "heading" ? " " : " ";
    return (node.content ?? []).map(collect).join("") + sep;
  };
  return collect(doc).replace(/\s+/g, " ").trim();
}

/** Estimasi waktu baca (menit) berdasarkan ~200 kata/menit. */
export function calcReadingTime(input: unknown): number {
  const words = extractPlainText(input).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
