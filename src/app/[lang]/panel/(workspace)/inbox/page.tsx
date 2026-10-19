import { protectPage } from "@/components/access/protected-page";
import { InboxPage } from "@/features/inbox/inbox-page";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.inbox);

function Page() {
  return <InboxPage />;
}

export default protectPage("inbox.read", Page);
