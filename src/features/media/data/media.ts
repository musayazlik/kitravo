export type MediaKind = "image" | "video" | "document";

export type MediaAsset = {
  id: string;
  name: string;
  kind: MediaKind;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt: string;
  /** Places that reference this file; deleting it would break them. `kind` picks the label in `t.media.details.usage`. */
  usedIn: { kind: "post" | "theme"; name: string; href: string }[];
  uploadedBy: string;
  createdAt: string;
  /** Gradient stand-in for the thumbnail until real UploadThing URLs are wired in. */
  swatch: [string, string];
};

const swatches: [string, string][] = [
  ["#3d41d6", "#9a4fb8"],
  ["#12876c", "#7fe0c2"],
  ["#e39a2d", "#c8432f"],
  ["#161821", "#3d41d6"],
  ["#9a4fb8", "#e39a2d"],
  ["#7b8195", "#eceef3"],
  ["#0b5e4b", "#3d41d6"],
  ["#c8432f", "#fdf3e2"],
];

const files: [string, MediaKind, string, number, number?, number?][] = [
  ["nordform-hero.webp", "image", "image/webp", 284_000, 2400, 1350],
  ["foundation-cover.webp", "image", "image/webp", 198_000, 1600, 900],
  ["campus-faculty-grid.webp", "image", "image/webp", 342_000, 2000, 1250],
  ["team-kranich.webp", "image", "image/webp", 412_000, 1800, 1200],
  ["lcp-before-after.png", "image", "image/png", 864_000, 1920, 1080],
  ["bitv-checklist.pdf", "document", "application/pdf", 1_240_000],
  ["nordform-2-4-walkthrough.mp4", "video", "video/mp4", 38_400_000, 1920, 1080],
  ["site-sets-diagram.webp", "image", "image/webp", 96_000, 1400, 800],
  ["avif-comparison.webp", "image", "image/webp", 156_000, 1600, 1000],
  ["licence-terms-2026.pdf", "document", "application/pdf", 420_000],
  ["mega-menu-preview.webp", "image", "image/webp", 228_000, 2200, 1300],
  ["agency-onboarding.mp4", "video", "video/mp4", 52_100_000, 1920, 1080],
  ["og-default.jpg", "image", "image/jpeg", 118_000, 1200, 630],
  ["focus-states.webp", "image", "image/webp", 88_000, 1200, 760],
  ["website-migration.webp", "image", "image/webp", 176_000, 1600, 900],
  ["content-blocks-table.webp", "image", "image/webp", 64_000, 1200, 700],
];

const DAY = 24 * 60 * 60 * 1000;
const base = Date.UTC(2026, 9, 18, 10);

export const mediaAssets: MediaAsset[] = files.map(([name, kind, mimeType, size, width, height], index) => ({
  id: `m${index + 1}`,
  name,
  kind,
  mimeType,
  size,
  width,
  height,
  alt: kind === "image" ? name.replace(/\.\w+$/, "").replace(/-/g, " ") : "",
  usedIn:
    index % 3 === 0
      ? [{ kind: "post" as const, name: "Nordform 2.4 release", href: "/panel/posts/p2" }]
      : index % 5 === 1
        ? [
            { kind: "theme" as const, name: "Foundation", href: "/panel/posts" },
            { kind: "post" as const, name: "Site sets explained", href: "/panel/posts/p7" },
          ]
        : [],
  uploadedBy: index % 2 ? "Lena Hoffmann" : "Musa Yazlık",
  createdAt: new Date(base - index * 2.3 * DAY).toISOString(),
  swatch: swatches[index % swatches.length],
}));

/**
 * Stand-in file URL for an asset: an SVG gradient matching its thumbnail.
 * Real uploads return their UploadThing URL instead.
 */
export function assetUrl(asset: MediaAsset) {
  const [from, to] = asset.swatch;
  const width = asset.width ?? 1600;
  const height = asset.height ?? 900;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
