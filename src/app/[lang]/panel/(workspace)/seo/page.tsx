import { protectPage } from "@/components/access/protected-page";
import { SeoPage } from "@/features/seo/seo-page";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.seo);

function Page() {
  return <SeoPage />;
}

export default protectPage("seo.read", Page);
