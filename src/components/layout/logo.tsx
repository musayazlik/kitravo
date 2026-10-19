import Image from "next/image";
import { brandConfig } from "@/config/brand";
import { cn } from "@/lib/utils";

/** Shared transparent brand mark; the adjacent wordmark supplies its accessible name. */
export function LogoMark({ className, sizes = "40px" }: { className?: string; sizes?: string }) {
  return (
    <Image
      src={brandConfig.logo.src}
      width={brandConfig.logo.width}
      height={brandConfig.logo.height}
      sizes={sizes}
      alt=""
      aria-hidden="true"
      className={cn("size-8 shrink-0 object-contain dark:brightness-125", className)}
    />
  );
}
