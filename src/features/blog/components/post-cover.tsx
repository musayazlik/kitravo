import { getCategory } from "@/features/posts/data/posts";
import type { Post } from "@/features/posts/data/schema";
import { cn } from "@/lib/utils";

/**
 * Cover art for a post until real cover images are uploaded: the category
 * colour printed over paper, with the kit's registration mark as a watermark.
 */
export function PostCover({ post, className }: { post: Post; className?: string }) {
  const color = getCategory(post.categoryId)?.color ?? "#3d41d6";
  const seed = Number(post.id.replace(/\D/g, "")) || 1;

  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden bg-paper", className)}
      style={{
        backgroundImage: `radial-gradient(120% 90% at ${20 + ((seed * 17) % 60)}% ${10 + ((seed * 29) % 50)}%, ${color}38, transparent 60%), linear-gradient(135deg, ${color}14, transparent)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="absolute -end-6 -bottom-8 size-40 opacity-25" fill="none" style={{ color }}>
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50 5v90M5 50h90" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="absolute top-4 start-4 h-1.5 w-10 rounded-sm" style={{ background: color }} />
    </div>
  );
}
