import { CategoryManager } from "@/modules/taxonomy/components/category-manager";
import { listCategories } from "@/modules/taxonomy/taxonomy.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requirePagePermission("taxonomy.manage");
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kategori untuk artikel, portfolio, dan klien.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
