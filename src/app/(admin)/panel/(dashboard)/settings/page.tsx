import { listPublishedApps } from "@/modules/apps/app.dal";
import { getMediaPick } from "@/modules/media/media.dal";
import { SettingsForm } from "@/modules/settings/components/settings-form";
import { getSiteSettings } from "@/modules/settings/settings.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePagePermission("settings.manage");
  const settings = await getSiteSettings();
  const [photo, heroImage, apps] = await Promise.all([
    getMediaPick(settings.owner_photo_media_id),
    getMediaPick(settings.hero_media_id),
    listPublishedApps(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Pengaturan Situs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Identitas situs, hero beranda, profil pembuat, dan kontak yang dipakai di seluruh situs.
        </p>
      </div>
      <SettingsForm
        initial={settings}
        initialMedia={{ owner_photo_media_id: photo, hero_media_id: heroImage }}
        apps={apps.map((app) => ({ slug: app.slug, name: app.name }))}
      />
    </div>
  );
}
