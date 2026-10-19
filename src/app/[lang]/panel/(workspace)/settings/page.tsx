import { protectPage } from "@/components/access/protected-page";
import { GeneralSettings } from "@/features/settings/general-settings";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.settings);

function Page() {
  return <GeneralSettings />;
}

export default protectPage("settings.read", Page);
