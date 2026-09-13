/**
 * Pintu masuk Worker WalDev (docs/09 §5.4, docs/10 §5).
 *
 * Membungkus Worker hasil build OpenNext. `POST /api/kontak` ditangani langsung oleh
 * `src/server/contact-endpoint.ts` sebelum masuk Next.js, supaya kiriman formulir kontak
 * tidak terkena batas CPU paket Workers Free. Permintaan lain diteruskan apa adanya.
 * Berkas ini sengaja JavaScript: di luar pemeriksaan `tsc`, karena Worker OpenNext baru ada
 * setelah build.
 */
import openNextWorker from "./.open-next/worker.js";
import { CONTACT_PATH, handleContactRequest } from "./src/server/contact-endpoint.ts";

const worker = {
  async fetch(request, env, ctx) {
    if (new URL(request.url).pathname === CONTACT_PATH) {
      return handleContactRequest(request, env);
    }
    return openNextWorker.fetch(request, env, ctx);
  },
};

export default worker;

export { BucketCachePurge, DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
