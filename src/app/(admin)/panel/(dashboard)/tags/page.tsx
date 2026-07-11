import { TagManager } from "@/modules/taxonomy/components/tag-manager";
import { listTags } from "@/modules/taxonomy/taxonomy.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  await requirePagePermission("taxonomy.manage");
  const tags = await listTags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
        <p className="mt-1 text-sm text-muted-foreground">Label untuk artikel.</p>
      </div>
      <TagManager tags={tags} />
    </div>
  );
}
