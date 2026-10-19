import { protectPage } from "@/components/access/protected-page";
import { StorageSettings } from "@/features/settings/storage-settings";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.crumbs.storage);

function Page() {
  return <StorageSettings />;
}

export default protectPage("settings.read", Page);
