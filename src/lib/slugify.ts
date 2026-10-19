/** Letters that Unicode normalisation does not reduce to ASCII on its own. */
const SPECIAL: Record<string, string> = { ı: "i", İ: "i", ß: "ss", æ: "ae", ø: "o", œ: "oe", đ: "d", ł: "l" };

/**
 * URL slug from a title: "Ağ güvenliği & SEO" → "ag-guvenligi-seo". Turkish
 * and German letters are transliterated; scripts without a Latin form
 * (Arabic, Chinese) yield an empty string, so callers keep a Latin slug for
 * those languages.
 */
export function slugify(value: string, maxLength = 60) {
  return value
    .replace(/[ıİßæøœđł]/g, (char) => SPECIAL[char])
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength)
    .replace(/-$/, "");
}
