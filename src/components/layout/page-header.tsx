import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

/** Title row every panel page opens with: what this page is, and its primary actions. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold md:text-[1.75rem]">{title}</h1>
        {description && <p className="max-w-[65ch] text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Page body: consistent gutters and vertical rhythm inside the sheet. */
export function Main({ className, ...props }: ComponentPropsWithoutRef<"main">) {
  return <Container as="main" size="panel" id="main" className={cn("flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8", className)} {...props} />;
}
