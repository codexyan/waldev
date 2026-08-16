import { SettingsForm } from "@/modules/settings/components/settings-form";
import { getSiteSettings } from "@/modules/settings/settings.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePagePermission("settings.manage");
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Pengaturan Situs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Identitas brand, kontak, dan sosial yang dipakai di seluruh situs.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
