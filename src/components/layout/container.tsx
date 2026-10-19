import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** One width system for the public site and workspace, including ultrawide displays. */
export function Container({ as: Tag = "div", size = "site", className, ...props }: ComponentPropsWithoutRef<"div"> & { as?: "div" | "section" | "main"; size?: "site" | "panel" | "reading" }) {
  return <Tag className={cn("mx-auto w-full min-w-0", size === "site" ? "max-w-[1200px]" : size === "panel" ? "max-w-[1280px]" : "max-w-[800px]", className)} {...props} />;
}
