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
        <h1 className="text-3xl">Kategori</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Kategori untuk artikel, portfolio, dan klien.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
