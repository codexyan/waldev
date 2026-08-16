import { MediaManager } from "@/modules/media/components/media-manager";
import { listMedia } from "@/modules/media/media.dal";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireSession();
  const items = await listMedia();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Pustaka Media</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola gambar, PDF, dan dokumen.</p>
      </div>
      <MediaManager items={items} />
    </div>
  );
}
