import { protectPage } from "@/components/access/protected-page";
import { NotificationSettings } from "@/features/settings/notification-settings";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.crumbs.notifications);

function Page() {
  return <NotificationSettings />;
}

export default protectPage("settings.read", Page);
