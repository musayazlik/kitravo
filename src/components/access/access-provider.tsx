"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import { can, type Permission, type Principal } from "@/lib/access/catalog";

const AccessContext = createContext<Principal | null>(null);
export function AccessProvider({ principal, children }: { principal: Principal; children: ReactNode }) {
  return <AccessContext value={principal}>{children}</AccessContext>;
}
export function useAccess() {
  const principal = use(AccessContext);
  return useMemo(() => ({ principal, can: (permission: Permission) => can(principal, permission) }), [principal]);
}
export function Can({ permission, children }: { permission: Permission; children: ReactNode }) {
  const access = useAccess();
  return access.can(permission) ? children : null;
}
