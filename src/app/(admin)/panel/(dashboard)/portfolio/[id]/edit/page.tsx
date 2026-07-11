import { notFound } from "next/navigation";
import { PortfolioForm } from "@/modules/portfolio/components/portfolio-form";
import { getPortfolioForEdit, listClientsForSelect } from "@/modules/portfolio/portfolio.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("portfolio.update");
  const { id } = await params;
  const [portfolio, clients] = await Promise.all([
    getPortfolioForEdit(id),
    listClientsForSelect(),
  ]);
  if (!portfolio) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Proyek</h1>
      <PortfolioForm
        initial={{
          id: portfolio.id,
          title: portfolio.title,
          slug: portfolio.slug,
          summary: portfolio.summary ?? "",
          challenge: portfolio.challenge ?? "",
          solution: portfolio.solution ?? "",
          timeline: portfolio.timeline ?? "",
          status: portfolio.status,
          clientId: portfolio.clientId ?? "",
          demoUrl: portfolio.demoUrl ?? "",
          repoUrl: portfolio.repoUrl ?? "",
          order: String(portfolio.order),
          isConfidential: portfolio.isConfidential,
          technologies: portfolio.technologies.join(", "),
          features: portfolio.features,
          thumbnail: portfolio.thumbnail,
          cover: portfolio.cover,
          gallery: portfolio.gallery,
        }}
        clients={clients}
      />
    </div>
  );
}
