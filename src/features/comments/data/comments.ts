import type { Locale } from "@/i18n/config";

export type CommentStatus = "pending" | "approved" | "spam";

export type BlogComment = {
  id: string;
  postId: string;
  /** Set on replies; replies are one level deep. */
  parentId: string | null;
  author: string;
  email: string;
  body: string;
  status: CommentStatus;
  /** Replies written from the panel by the team. */
  isStaff: boolean;
  createdAt: string;
  /** The translation of the post it was written under; each language shows its own thread. */
  locale: Locale;
};

/** Badge tone per status; the label comes from `t.comments.status`. */
export const commentStatusMeta: Record<CommentStatus, { tone: "proof" | "signal" | "rust" }> = {
  pending: { tone: "proof" },
  approved: { tone: "signal" },
  spam: { tone: "rust" },
};

export const comments: BlogComment[] = [
  { id: "cm1", postId: "p1", parentId: null, author: "Hannah Krause", email: "hannah@krause-web.de", body: "The inventory step saved us. We found two extensions without a 13 release and replaced them before touching the core.", status: "approved", isStaff: false, createdAt: "2026-10-17T09:20:00Z", locale: "en" },
  { id: "cm2", postId: "p1", parentId: "cm1", author: "Musa Yazlık", email: "musa@kitravo.com", body: "That is exactly the order we recommend. Replacing them first keeps the upgrade itself boring, which is the goal.", status: "approved", isStaff: true, createdAt: "2026-10-17T11:02:00Z", locale: "en" },
  { id: "cm3", postId: "p1", parentId: null, author: "Tim Berger", email: "tim@berger.digital", body: "Did you run the database compare wizard before or after switching to site sets?", status: "pending", isStaff: false, createdAt: "2026-10-18T07:45:00Z", locale: "en" },
  { id: "cm4", postId: "p2", parentId: null, author: "Clara Becker", email: "clara@becker-web.de", body: "Dark mode looks great. Is there a way to set it per page tree?", status: "approved", isStaff: false, createdAt: "2026-10-16T15:10:00Z", locale: "en" },
  { id: "cm5", postId: "p2", parentId: null, author: "SEO Booster", email: "deals@seo-booster.biz", body: "Get 10,000 backlinks today for only 49 dollars!!! Visit our site now.", status: "spam", isStaff: false, createdAt: "2026-10-16T03:33:00Z", locale: "en" },
  { id: "cm6", postId: "p5", parentId: null, author: "Jonas Pfeiffer", email: "jonas@pfeiffer.media", body: "800 ms is impressive. Was most of it the hero image or the font loading?", status: "pending", isStaff: false, createdAt: "2026-10-18T08:30:00Z", locale: "en" },
  { id: "cm7", postId: "p5", parentId: null, author: "Lea Hartmann", email: "lea@hartmann-studio.de", body: "We applied the preload trick from this post and our LCP dropped below two seconds on mobile.", status: "approved", isStaff: false, createdAt: "2026-10-12T13:15:00Z", locale: "en" },
  { id: "cm8", postId: "p7", parentId: null, author: "Mert Yıldız", email: "mert@yildiz.dev", body: "The third config with the shared base set is the one I was missing. Thanks for spelling it out.", status: "pending", isStaff: false, createdAt: "2026-10-17T19:05:00Z", locale: "en" },
  { id: "cm9", postId: "p13", parentId: null, author: "Sophie Lang", email: "sophie@lang-design.de", body: "21 days sounds tight. How did you handle content migration from the old site?", status: "approved", isStaff: false, createdAt: "2026-10-09T10:40:00Z", locale: "en" },
  { id: "cm10", postId: "p14", parentId: null, author: "Peter Wolf", email: "peter@wolf-agentur.de", body: "Sharing this with our editors. The examples of good versus vague alt text are spot on.", status: "pending", isStaff: false, createdAt: "2026-10-18T06:12:00Z", locale: "en" },
  { id: "cm11", postId: "p1", parentId: null, author: "Ayşe Demir", email: "ayse@demirdijital.com.tr", body: "Envanter adımı bizim için de hayat kurtardı. Geçişten önce üç eklentiyi değiştirmek zorunda kaldık.", status: "approved", isStaff: false, createdAt: "2026-10-16T12:10:00Z", locale: "tr" },
  { id: "cm12", postId: "p1", parentId: null, author: "Katrin Vogel", email: "katrin@vogel-medien.de", body: "Sehr hilfreich. Habt ihr die Site Sets vor oder nach dem Core-Update eingeführt?", status: "pending", isStaff: false, createdAt: "2026-10-18T09:05:00Z", locale: "de" },
  { id: "cm13", postId: "p5", parentId: null, author: "ليلى حداد", email: "layla@haddad.studio", body: "جرّبنا التحميل المسبق للصورة الرئيسية وانخفض LCP لدينا بشكل واضح على الجوال.", status: "approved", isStaff: false, createdAt: "2026-10-14T16:40:00Z", locale: "ar" },
  { id: "cm14", postId: "p5", parentId: null, author: "王磊", email: "wang.lei@pixelcraft.cn", body: "字体那一条很有用，我们去掉一个字重后首屏快了不少。", status: "approved", isStaff: false, createdAt: "2026-10-15T02:20:00Z", locale: "zh" },
  { id: "cm15", postId: "p2", parentId: null, author: "Emre Kaya", email: "emre@kaya.dev", body: "Koyu modu sayfa ağacına göre ayarlamak mümkün mü?", status: "pending", isStaff: false, createdAt: "2026-10-18T10:00:00Z", locale: "tr" },
];

/** The thread under one translation of a post. */
export function commentsFor(postId: string, locale: Locale, status: CommentStatus = "approved") {
  return comments.filter((comment) => comment.postId === postId && comment.locale === locale && comment.status === status);
}
