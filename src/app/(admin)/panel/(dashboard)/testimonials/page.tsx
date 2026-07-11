import { listClientsForSelect } from "@/modules/portfolio/portfolio.dal";
import { TestimonialManager } from "@/modules/testimonials/components/testimonial-manager";
import { listTestimonialsForManage } from "@/modules/testimonials/testimonial.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  await requirePagePermission("testimonial.manage");
  const [testimonials, clients] = await Promise.all([
    listTestimonialsForManage(),
    listClientsForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Testimonials</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hanya testimoni berstatus published yang tampil di publik.
        </p>
      </div>
      <TestimonialManager testimonials={testimonials} clients={clients} />
    </div>
  );
}
