import { ServiceForm } from "@/modules/services/components/service-form";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await requirePagePermission("service.create");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Layanan Baru</h1>
      <ServiceForm
        initial={{
          name: "",
          slug: "",
          description: "",
          price: "",
          ctaLabel: "",
          ctaUrl: "",
          status: "active",
          order: "0",
          features: [],
          workflow: [],
          faqs: [],
        }}
      />
    </div>
  );
}
