import { z } from "zod";
import { accessResponse, assertSameOrigin } from "@/lib/access/http";
import { assignRoles } from "@/lib/access/repository";
import { requirePermission } from "@/lib/access/session";

export async function PATCH(request: Request) {
  return accessResponse(async () => {
    assertSameOrigin(request);
    const actor = await requirePermission("users.manage");
    const input = z.object({ userId: z.string().min(1), roles: z.array(z.string().min(1)).min(1).max(20) }).strict().parse(await request.json());
    await assignRoles(actor, input.userId, input.roles);
    return { ok: true };
  });
}
