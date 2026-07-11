import { notFound } from "next/navigation";
import { ServiceForm } from "@/modules/services/components/service-form";
import { getServiceForEdit } from "@/modules/services/service.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("service.update");
  const { id } = await params;
  const service = await getServiceForEdit(id);
  if (!service) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Layanan</h1>
      <ServiceForm
        initial={{
          id: service.id,
          name: service.name,
          slug: service.slug,
          description: service.description ?? "",
          price: service.price ?? "",
          ctaLabel: service.ctaLabel ?? "",
          ctaUrl: service.ctaUrl ?? "",
          status: service.status,
          order: String(service.order),
          features: service.features,
          workflow: service.workflow,
          faqs: service.faqs,
        }}
      />
    </div>
  );
}
