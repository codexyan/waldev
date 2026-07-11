import { NavigationManager } from "@/modules/navigation/components/navigation-manager";
import { getMenuItems } from "@/modules/navigation/navigation.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function NavigationPage() {
  await requirePagePermission("navigation.manage");
  const [header, footer] = await Promise.all([getMenuItems("header"), getMenuItems("footer")]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Navigation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Menu header & footer situs publik. Kosongkan untuk memakai menu bawaan.
        </p>
      </div>
      <NavigationManager
        header={header.map((i) => ({ label: i.label, url: i.url }))}
        footer={footer.map((i) => ({ label: i.label, url: i.url }))}
      />
    </div>
  );
}
