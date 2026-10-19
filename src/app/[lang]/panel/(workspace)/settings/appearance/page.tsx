import { protectPage } from "@/components/access/protected-page";
import { AppearanceSettings } from "@/features/settings/appearance-settings";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.crumbs.appearance);

function Page() {
  return <AppearanceSettings />;
}

export default protectPage("settings.read", Page);
