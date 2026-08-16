/**
 * Tangkapan layar halaman lewat Chrome DevTools Protocol.
 *
 *   node scripts/shot.mjs <url> <keluaran.png> [lebar] [tinggi] [light|dark] [full|fold] [skala] [tungguMs]
 *
 * Contoh:
 *   node scripts/shot.mjs http://localhost:3000/ home.png 1440 950 dark fold
 *   node scripts/shot.mjs http://localhost:3000/ home-full.png 1440 950 light full
 *
 * Variabel lingkungan opsional:
 *   SHOT_COOKIE  "nama=nilai" untuk membuka halaman yang butuh sesi, misalnya /panel
 *   SHOT_EVAL    potongan JavaScript yang dijalankan sebelum ditangkap, misalnya membuka menu
 *   SHOT_PORT_OFFSET  geser port debug bila menjalankan beberapa proses sekaligus
 *
 * Mode "full" menggulir halaman sampai bawah lebih dulu supaya elemen
 * [data-reveal] sudah tampil, lalu menangkap seluruh halaman.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [
  url,
  out,
  width = "1440",
  height = "950",
  scheme = "dark",
  mode = "fold",
  scale = "1",
  waitMs = "2600",
] = process.argv.slice(2);

if (!url || !out) {
  console.error(
    "Pemakaian: node scripts/shot.mjs <url> <keluaran.png> [lebar] [tinggi] [light|dark] [full|fold] [skala] [tungguMs]",
  );
  process.exit(1);
}

// Lokasi Chrome dapat ditimpa lewat CHROME_PATH bila berbeda di mesin lain.
const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ].find((candidate) => existsSync(candidate)) ??
  "chrome";
const PORT = 9333 + (Number(process.env.SHOT_PORT_OFFSET) || 0);
const profile = mkdtempSync(join(tmpdir(), "shot-"));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${PORT}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targets() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome belum siap, coba lagi.
    }
    await sleep(250);
  }
  throw new Error("Chrome tidak merespons pada port debug");
}

const wsUrl = await targets();
const ws = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
const events = new Map();

ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  } else if (msg.method && events.has(msg.method)) {
    events.get(msg.method)();
    events.delete(msg.method);
  }
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

const once = (method) => new Promise((resolve) => events.set(method, resolve));

await send("Page.enable");

// Sesi opsional: SHOT_COOKIE berisi "nama=nilai" agar halaman terkunci bisa dibuka.
if (process.env.SHOT_COOKIE) {
  const [name, ...rest] = process.env.SHOT_COOKIE.split("=");
  await send("Network.enable");
  await send("Network.setCookie", {
    name,
    value: rest.join("="),
    domain: new URL(url).hostname,
    path: "/",
    secure: url.startsWith("https"),
    httpOnly: true,
  });
}
await send("Emulation.setDeviceMetricsOverride", {
  width: Number(width),
  height: Number(height),
  deviceScaleFactor: Number(scale),
  mobile: Number(width) < 600,
});
await send("Emulation.setEmulatedMedia", {
  media: "screen",
  features: [{ name: "prefers-color-scheme", value: scheme }],
});

const loaded = once("Page.loadEventFired");
await send("Page.navigate", { url });
await Promise.race([loaded, sleep(20000)]);
await sleep(Number(waitMs));

// Elemen [data-reveal] baru tampil setelah masuk viewport, jadi halaman digulir
// sampai bawah lebih dulu supaya semuanya sudah terlihat saat ditangkap.
if (mode === "full") {
  await send("Runtime.evaluate", {
    awaitPromise: true,
    expression: `(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      const step = Math.round(window.innerHeight * 0.7);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 140));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 700));
    })()`,
  });
}

// Interaksi opsional sebelum ditangkap, misalnya membuka laci menu.
if (process.env.SHOT_EVAL) {
  await send("Runtime.evaluate", { awaitPromise: true, expression: process.env.SHOT_EVAL });
}

const { data } = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: mode === "full",
  optimizeForSpeed: false,
});
writeFileSync(out, Buffer.from(data, "base64"));

const bytes = Buffer.from(data, "base64").length;
console.log(`${out} | ${width}x${height} | ${scheme} | ${mode} | ${bytes} bytes`);

ws.close();
chrome.kill();
process.exit(0);
