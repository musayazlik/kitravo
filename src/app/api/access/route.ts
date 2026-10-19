import { getPrincipal } from "@/lib/access/session";
import { can } from "@/lib/access/catalog";
import { accessResponse } from "@/lib/access/http";
import { listAudit, listRoles, listUsers } from "@/lib/access/repository";

export async function GET() {
  return accessResponse(async () => {
    const principal = await getPrincipal();
    return {
      principal,
      roles: can(principal, "roles.read") || can(principal, "users.manage") ? await listRoles() : [],
      users: can(principal, "users.read") ? await listUsers() : [],
      audit: can(principal, "audit.read") ? await listAudit() : [],
    };
  });
}
