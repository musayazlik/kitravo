import { protectPage } from "@/components/access/protected-page";
import { McpPage } from "@/features/mcp/mcp-page";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.mcp);

function Page() {
  return <McpPage />;
}

export default protectPage("mcp.read", Page);
