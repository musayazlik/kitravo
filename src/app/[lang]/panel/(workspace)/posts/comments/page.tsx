import { protectPage } from "@/components/access/protected-page";
import { CommentsPage } from "@/features/comments/comments-page";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.comments);

function Page() {
  return <CommentsPage />;
}

export default protectPage("comments.read", Page);
