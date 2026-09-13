import { EMPTY_DOC } from "@/lib/tiptap";
import { AppForm } from "@/modules/apps/components/app-form";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function NewAppPage() {
  await requirePagePermission("app.create");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Aplikasi Baru</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Setelah dibuat, kotak catatan muncul di halaman sunting aplikasi.
        </p>
      </div>
      <AppForm
        initial={{
          name: "",
          slug: "",
          tagline: "",
          descriptionJson: EMPTY_DOC,
          status: "building",
          isPublished: false,
          appUrl: "",
          repoUrl: "",
          videoUrl: "",
          startedAt: "",
          releasedAt: "",
          retiredAt: "",
          technologies: "",
          features: [],
          logo: null,
          cover: null,
          gallery: [],
          guideJson: EMPTY_DOC,
          faqs: [],
          showGuide: false,
          showFaq: false,
          showNotes: true,
          showReleases: false,
          seo: { metaTitle: "", metaDescription: "", noIndex: false },
        }}
      />
    </div>
  );
}
