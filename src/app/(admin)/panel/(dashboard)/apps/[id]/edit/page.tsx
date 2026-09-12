import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ADMIN_BASE } from "@/lib/constants";
import { toDateInput } from "@/lib/date";
import { EMPTY_DOC } from "@/lib/tiptap";
import { getAppForEdit, listAppNotes } from "@/modules/apps/app.dal";
import { AppForm } from "@/modules/apps/components/app-form";
import { AppNotesList, NoteComposer } from "@/modules/apps/components/app-notes";
import { getSeoMeta } from "@/modules/seo/seo.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

function parseDoc(value: string | null): unknown {
  if (!value) return EMPTY_DOC;
  try {
    return JSON.parse(value);
  } catch {
    // biarkan dokumen kosong bila JSON rusak
    return EMPTY_DOC;
  }
}

export default async function EditAppPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("app.update");
  const { id } = await params;
  const [app, notes, seo] = await Promise.all([
    getAppForEdit(id),
    listAppNotes(id),
    getSeoMeta("app", id),
  ]);
  if (!app) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`${ADMIN_BASE}/apps`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Semua aplikasi
        </Link>
        <h1 className="mt-2 text-3xl">{app.name}</h1>
      </div>

      {/* Kotak catatan di paling atas: menulis kabar harus lebih cepat daripada
          menyunting data aplikasinya. */}
      <section className="border-border bg-card rounded-xl border">
        <div className="border-border border-b px-5 py-4">
          <h2 className="text-base font-semibold">Catatan</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Kabar singkat tentang aplikasi ini. Tampil di halaman aplikasi bila bagian Catatan
            pembuatan atau Catatan rilis dinyalakan.
          </p>
        </div>
        <div className="space-y-6 p-5">
          <NoteComposer appId={app.id} />
          <AppNotesList notes={notes} />
        </div>
      </section>

      <AppForm
        initial={{
          id: app.id,
          name: app.name,
          slug: app.slug,
          tagline: app.tagline ?? "",
          descriptionJson: parseDoc(app.descriptionJson),
          status: app.status,
          isPublished: app.isPublished,
          appUrl: app.appUrl ?? "",
          repoUrl: app.repoUrl ?? "",
          videoUrl: app.videoUrl ?? "",
          startedAt: toDateInput(app.startedAt),
          releasedAt: toDateInput(app.releasedAt),
          retiredAt: toDateInput(app.retiredAt),
          technologies: app.technologies.join(", "),
          features: app.features,
          cover: app.cover,
          gallery: app.gallery,
          guideJson: parseDoc(app.guideJson),
          faqs: app.faqs,
          showGuide: app.showGuide,
          showFaq: app.showFaq,
          showNotes: app.showNotes,
          showReleases: app.showReleases,
          seo,
        }}
      />
    </div>
  );
}
