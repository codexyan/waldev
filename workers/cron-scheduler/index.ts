// Worker terpisah: memicu endpoint publish-scheduled aplikasi secara terjadwal.
// OpenNext tidak mudah menambah handler scheduled() ke worker utama, jadi cron
// dipisah ke worker kecil ini. Deploy: lihat README (Scheduled publish).

interface Env {
  CRON_TARGET: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(
    _controller: unknown,
    env: Env,
    ctx: { waitUntil(promise: Promise<unknown>): void },
  ): Promise<void> {
    ctx.waitUntil(
      fetch(env.CRON_TARGET, {
        method: "POST",
        headers: { "x-cron-secret": env.CRON_SECRET },
      }),
    );
  },
};
