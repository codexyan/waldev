const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Ambil ID video dari tautan YouTube (watch, youtu.be, embed, shorts, live).
 * Video aplikasi sengaja dibatasi ke YouTube supaya pemutarnya bisa dimuat
 * setelah diklik, bukan saat halaman dibuka.
 */
export function getYoutubeId(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^(www|m)\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id =
      url.pathname === "/watch"
        ? url.searchParams.get("v")
        : (url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null);
  }

  return id && VIDEO_ID.test(id) ? id : null;
}
