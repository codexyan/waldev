import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

// Seluruh area /panel tidak boleh terindeks. Layout ini sengaja minimal:
// shell + guard berada di grup rute (dashboard) sehingga /panel/login tidak terkunci.
export const metadata: Metadata = {
  title: { default: "Admin", template: `%s · ${SITE.name} Admin` },
  robots: { index: false, follow: false, nocache: true },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
