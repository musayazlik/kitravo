import { protectPage } from "@/components/access/protected-page";
import { TaxonomyPage } from "@/features/posts/taxonomy-page";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.tags);

function TagsPage() {
  return <TaxonomyPage kind="tags" />;
}

export default protectPage("posts.read", TagsPage);
