import { notFound } from "next/navigation";
import { getArticleForEdit, listArticleCategories } from "@/modules/articles/article.dal";
import { ArticleForm } from "@/modules/articles/components/article-form";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

function toDatetimeLocal(value: Date | null): string {
  if (!value) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("article.update");
  const { id } = await params;
  const [article, categories] = await Promise.all([
    getArticleForEdit(id),
    listArticleCategories(),
  ]);
  if (!article) notFound();

  let contentJson: unknown = { type: "doc", content: [] };
  if (article.contentJson) {
    try {
      contentJson = JSON.parse(article.contentJson);
    } catch {
      // biarkan dokumen kosong bila JSON rusak
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Artikel</h1>
      <ArticleForm
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          summary: article.summary ?? "",
          categoryId: article.categoryId ?? "",
          tags: article.tags.join(", "),
          status: article.status,
          scheduledAt: toDatetimeLocal(article.scheduledAt),
          contentJson,
        }}
        categories={categories}
      />
    </div>
  );
}
