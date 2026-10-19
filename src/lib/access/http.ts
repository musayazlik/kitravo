import "server-only";
import { AccessError } from "./policy";
import { z } from "zod";
import { unstable_rethrow } from "next/navigation";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.BETTER_AUTH_URL ?? request.url).origin;
  if (!origin || origin !== expected) throw new AccessError("Invalid request origin.");
}
export async function accessResponse(work: () => Promise<unknown>) {
  try { return Response.json(await work(), { headers: { "Cache-Control": "private, no-store" } }); }
  catch (error) {
    // Cache Components uses internal exceptions to defer headers/cookies to request time.
    unstable_rethrow(error);
    if (error instanceof AccessError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof z.ZodError || error instanceof SyntaxError) return Response.json({ error: "Invalid input. Check the fields." }, { status: 400 });
    console.error("Access operation failed", error);
    return Response.json({ error: "The operation could not be completed." }, { status: 500 });
  }
}
