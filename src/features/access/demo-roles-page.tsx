import { getDictionary } from "@/i18n/server";
import { demoAccessData } from "./data/demo-access";
import { RolesPage } from "./roles-page";

export async function DemoRolesPage() {
  const t = await getDictionary();
  const { roles } = demoAccessData(t.access);
  return <RolesPage roles={roles} audit={[]} />;
}
