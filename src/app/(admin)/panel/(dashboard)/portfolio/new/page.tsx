import { PortfolioForm } from "@/modules/portfolio/components/portfolio-form";
import { listClientsForSelect } from "@/modules/portfolio/portfolio.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function NewPortfolioPage() {
  await requirePagePermission("portfolio.create");
  const clients = await listClientsForSelect();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Karya Baru</h1>
      <PortfolioForm
        initial={{
          title: "",
          slug: "",
          summary: "",
          challenge: "",
          solution: "",
          timeline: "",
          status: "completed",
          clientId: "",
          demoUrl: "",
          repoUrl: "",
          order: "0",
          isConfidential: false,
          technologies: "",
          features: [],
          thumbnail: null,
          cover: null,
          gallery: [],
          seo: { metaTitle: "", metaDescription: "", noIndex: false },
        }}
        clients={clients}
      />
    </div>
  );
}
