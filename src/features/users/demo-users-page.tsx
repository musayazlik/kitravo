import { getDictionary } from "@/i18n/server";
import { demoAccessData } from "@/features/access/data/demo-access";
import { UsersPage } from "./users-page";

export async function DemoUsersPage() {
  const t = await getDictionary();
  const { users, roles } = demoAccessData(t.access);
  return <UsersPage users={users} roles={roles} />;
}
