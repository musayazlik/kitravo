import { z } from "zod";
import { isPermission } from "@/lib/access/catalog";
import { accessResponse, assertSameOrigin } from "@/lib/access/http";
import { deleteRole, saveRole } from "@/lib/access/repository";
import { requirePermission } from "@/lib/access/session";

const schema = z.object({ id: z.string().uuid().optional(), name: z.string().trim().min(2).max(60), description: z.string().trim().max(240), permissions: z.array(z.string().refine(isPermission)).max(50) }).strict();
export async function POST(request: Request) {
  return accessResponse(async () => {
    assertSameOrigin(request);
    const actor = await requirePermission("roles.manage");
    const input = schema.parse(await request.json());
    return { id: await saveRole(actor, input) };
  });
}
export async function DELETE(request: Request) {
  return accessResponse(async () => {
    assertSameOrigin(request);
    const actor = await requirePermission("roles.manage");
    const { id } = z.object({ id: z.string().min(1) }).strict().parse(await request.json());
    await deleteRole(actor, id);
    return { ok: true };
  });
}
