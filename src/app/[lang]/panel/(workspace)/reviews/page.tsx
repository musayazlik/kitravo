import { protectPage } from "@/components/access/protected-page";
import { ReviewsPage } from "@/features/reviews/reviews-page";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.reviews);

function Page() {
  return <ReviewsPage />;
}

export default protectPage("reviews.read", Page);
