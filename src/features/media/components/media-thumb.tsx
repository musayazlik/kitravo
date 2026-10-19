import { FileText, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "../data/media";

/** Thumbnail for any asset. Swap the gradient for <Image src={asset.url}> once uploads are real. */
export function MediaThumb({ asset, className }: { asset: MediaAsset; className?: string }) {
  return (
    <div
      className={cn("relative grid aspect-[4/3] place-items-center overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${asset.swatch[0]}, ${asset.swatch[1]})` }}
      role="img"
      aria-label={asset.alt || asset.name}
    >
      {asset.kind === "video" && (
        <span className="grid size-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm">
          <Play className="size-4 translate-x-px fill-current" />
        </span>
      )}
      {asset.kind === "document" && (
        <span className="grid size-10 place-items-center rounded-lg bg-white/85">
          <FileText className="size-5 text-[#161821]" />
        </span>
      )}
    </div>
  );
}
