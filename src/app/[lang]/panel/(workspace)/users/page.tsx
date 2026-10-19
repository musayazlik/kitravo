import { UsersPage } from "@/features/users/users-page";
import { DemoUsersPage } from "@/features/users/demo-users-page";
import { titleMetadata } from "@/i18n/server";
import { listRoles, listUsers } from "@/lib/access/repository";
import { protectPage } from "@/components/access/protected-page";
import { requirePermission } from "@/lib/access/session";

export const generateMetadata = titleMetadata((t) => t.nav.items.users);

async function Page() {
  await requirePermission("users.read");
  const [users, roles] = await Promise.all([listUsers(), listRoles()]);
  return <UsersPage users={users} roles={roles} />;
}
export default protectPage("users.read", Page, DemoUsersPage);
