import { protectPage } from "@/components/access/protected-page";
import { Dashboard } from "@/features/dashboard";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.dashboard);

function DashboardPage() {
  return <Dashboard />;
}

export default protectPage("dashboard.read", DashboardPage);
