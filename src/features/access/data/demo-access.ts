import type { Dictionary } from "@/i18n/dictionary";
import { systemRoles, type AccessUser, type Role } from "@/lib/access/catalog";

/** Standalone fixtures: never derive demo content from the user or role repositories. */
export function demoAccessData(copy: Dictionary["access"]): { users: AccessUser[]; roles: Role[] } {
  const roles: Role[] = (["superadmin", "admin", "user", "demo"] as const).map((id) => ({
    id,
    system: true,
    ...copy.previewRoles[id],
    permissions: [...systemRoles.find((role) => role.id === id)!.permissions],
  }));
  roles.push({
    id: "sample-editor",
    system: false,
    ...copy.previewRoles.editor,
    permissions: ["dashboard.read", "posts.read", "posts.create", "posts.update", "media.read", "comments.read"],
  });
  const users: AccessUser[] = [
    { id: "sample-user-1", name: "Alex Morgan", email: "alex@example.test", roles: ["superadmin"], demo: false },
    { id: "sample-user-2", name: "Deniz Arslan", email: "deniz@example.test", roles: ["admin"], demo: false },
    { id: "sample-user-3", name: "Sam Taylor", email: "sam@example.test", roles: ["user", "sample-editor"], demo: false },
    { id: "sample-user-4", name: "Robin Chen", email: "robin@example.test", roles: ["sample-editor"], demo: false },
    { id: "sample-user-5", name: "Noor Ali", email: "noor@example.test", roles: ["user"], demo: false },
  ];
  return { users, roles };
}
