import { Main } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for list pages while URL-dependent content streams in. */
export function TablePageSkeleton() {
  return (
    <Main aria-busy>
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-px overflow-hidden rounded-lg border">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-12 rounded-none" />
        ))}
      </div>
    </Main>
  );
}
