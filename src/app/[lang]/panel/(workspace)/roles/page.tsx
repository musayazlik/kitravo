import { RolesPage } from "@/features/access/roles-page";
import { DemoRolesPage } from "@/features/access/demo-roles-page";
import { protectPage } from "@/components/access/protected-page";
import { requirePermission } from "@/lib/access/session";
import { listAudit, listRoles } from "@/lib/access/repository";
import { can } from "@/lib/access/catalog";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.access.title);
async function Page() {
  const principal = await requirePermission("roles.read");
  const [roles, audit] = await Promise.all([listRoles(), can(principal, "audit.read") ? listAudit() : []]);
  return <RolesPage roles={roles} audit={audit} />;
}
export default protectPage("roles.read", Page, DemoRolesPage);
