import { listArticleCategories } from "@/modules/articles/article.dal";
import { ArticleForm } from "@/modules/articles/components/article-form";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  await requirePagePermission("article.create");
  const categories = await listArticleCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Artikel Baru</h1>
      <ArticleForm
        initial={{
          title: "",
          slug: "",
          summary: "",
          categoryId: "",
          tags: "",
          status: "draft",
          scheduledAt: "",
          contentJson: { type: "doc", content: [] },
          cover: null,
        }}
        categories={categories}
      />
    </div>
  );
}
