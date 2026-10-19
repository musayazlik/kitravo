"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import type { Permission } from "@/lib/access/catalog";
import { useAccess } from "./access-provider";

/** UI convenience only; server mutations must also call requirePermission. */
export function ActionButton({ permission, ...props }: ComponentProps<typeof Button> & { permission: Permission }) {
  const access = useAccess();
  if (!access.can(permission)) return null;
  return <Button {...props} />;
}
