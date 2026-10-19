import { comments } from "@/features/comments/data/comments";
import { brandConfig } from "@/config/brand";

/**
 * Sample workspace details and counts until content queries are connected.
 * Authenticated identity comes from `lib/access/session`, never this file.
 */
export const workspace = {
  name: brandConfig.name,
  domain: "kitravo.com",
  storage: { usedMb: 1384, limitMb: 2048 },
};

export const liveCounts = {
  inbox: 4,
  reviews: 3,
  comments: comments.filter((comment) => comment.status === "pending").length,
};

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
