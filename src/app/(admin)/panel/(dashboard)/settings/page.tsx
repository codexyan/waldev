import { getMediaPick } from "@/modules/media/media.dal";
import { SettingsForm } from "@/modules/settings/components/settings-form";
import { getSiteSettings } from "@/modules/settings/settings.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePagePermission("settings.manage");
  const settings = await getSiteSettings();
  const photo = await getMediaPick(settings.owner_photo_media_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Pengaturan Situs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Identitas situs, profil pembuat, dan kontak yang dipakai di seluruh situs.
        </p>
      </div>
      <SettingsForm initial={settings} initialPhoto={photo} />
    </div>
  );
}
