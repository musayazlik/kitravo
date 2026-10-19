export type Range = "7d" | "30d" | "90d";

export const rangeDays: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };

const end = Date.UTC(2026, 9, 18);
const DAY = 24 * 60 * 60 * 1000;

/** Deterministic pseudo-random walk, so server and client render the same numbers. */
function wave(index: number, seed: number) {
  return Math.sin(index * 0.41 + seed) * 0.5 + Math.sin(index * 0.13 + seed * 2) * 0.35 + Math.cos(index * 0.9) * 0.15;
}

export const readership = Array.from({ length: 90 }, (_, index) => {
  const date = new Date(end - (89 - index) * DAY);
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  const trend = 1 + index / 180;
  const views = Math.round((1450 + wave(index, 1) * 520) * trend * (weekend ? 0.62 : 1));
  const readers = Math.round(views * (0.58 + wave(index, 3) * 0.06));
  return { date: date.toISOString().slice(0, 10), views, readers };
});

export function readershipFor(range: Range) {
  return readership.slice(-rangeDays[range]);
}

/** Posts per pipeline stage. Counts per range let the band move when the range changes. */
export const pipeline: Record<Range, { draft: number; review: number; scheduled: number; published: number }> = {
  "7d": { draft: 4, review: 3, scheduled: 2, published: 3 },
  "30d": { draft: 4, review: 3, scheduled: 2, published: 12 },
  "90d": { draft: 4, review: 3, scheduled: 2, published: 31 },
};

export const previousPublished: Record<Range, number> = { "7d": 2, "30d": 9, "90d": 27 };

/** Text for each kind comes from `t.dashboard.attention`. */
export const attention = [
  { id: "a1", kind: "reviews", count: 3, href: "/panel/reviews" },
  { id: "a2", kind: "inbox", count: 4, href: "/panel/inbox" },
  { id: "a3", kind: "seo", count: 5, href: "/panel/seo" },
  { id: "a4", kind: "mail", count: 2, href: "/panel/mail" },
] as const;

export const mailDelivery = Array.from({ length: 14 }, (_, index) => {
  const date = new Date(end - (13 - index) * DAY);
  const delivered = Math.round(64 + wave(index, 5) * 22);
  return { day: date.toISOString().slice(5, 10), delivered, bounced: index % 5 === 3 ? 2 : index % 4 === 1 ? 1 : 0 };
});

/** `detail` names a `t.dashboard.mcp.details` message; post titles stay in the language they were written in. */
export const mcpActivity = [
  { id: "m1", client: "Claude Desktop", tool: "blog_posts_create", detail: { key: "draft", title: "Caching strategies…" }, at: "2026-10-18T08:42:00Z" },
  { id: "m2", client: "Telegram bot", tool: "reviews_moderate", detail: { key: "approved", count: 2 }, at: "2026-10-18T07:15:00Z" },
  { id: "m3", client: "Cursor", tool: "media_list", detail: { key: "listed", count: 24 }, at: "2026-10-17T19:03:00Z" },
  { id: "m4", client: "Claude Desktop", tool: "ai_generate_image", detail: { key: "cover", title: "BITV 2.0…" }, at: "2026-10-17T16:31:00Z" },
] as const;
