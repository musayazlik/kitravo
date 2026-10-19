import { protectPage } from "@/components/access/protected-page";
import { TaxonomyPage } from "@/features/posts/taxonomy-page";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.categories);

function CategoriesPage() {
  return <TaxonomyPage kind="categories" />;
}

export default protectPage("posts.read", CategoriesPage);
