"use client";

export async function mutateAccess(path: "roles" | "users", method: "POST" | "PATCH" | "DELETE", body: unknown) {
  const response = await fetch(`/api/access/${path}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}
