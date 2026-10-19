import { localeInfo, type Locale } from "@/i18n/config";
import { slugify } from "@/lib/slugify";
import type { Category, Post, PostContent, Tag } from "./schema";

export const categories: Category[] = [
  {
    id: "c1",
    name: "Web development guides",
    slug: "web-development-guides",
    description: "Hands-on walkthroughs for site builders.",
    color: "#3d41d6",
    postCount: 9,
    translations: {
      tr: { name: "Web geliştirme rehberleri", description: "Site geliştiriciler için uygulamalı anlatımlar." },
      de: { name: "Webentwicklungs-Leitfäden", description: "Praxisnahe Anleitungen für Website-Builder." },
      ar: { name: "أدلة تطوير الويب", description: "شروحات عملية لبناة المواقع." },
      zh: { name: "Web 开发指南", description: "面向建站者的实战教程。" },
    },
  },
  {
    id: "c2",
    name: "Release notes",
    slug: "release-notes",
    description: "What changed in each theme and extension.",
    color: "#12876c",
    postCount: 6,
    translations: {
      tr: { name: "Sürüm notları", description: "Her tema ve eklentide neler değişti." },
      de: { name: "Versionshinweise", description: "Was sich in jedem Theme und jeder Extension geändert hat." },
      ar: { name: "ملاحظات الإصدار", description: "ما الذي تغيّر في كل قالب وإضافة." },
      zh: { name: "版本说明", description: "每个主题和扩展的变更内容。" },
    },
  },
  {
    id: "c3",
    name: "Agency stories",
    slug: "agency-stories",
    description: "How agencies ship faster with Kitravo.",
    color: "#e39a2d",
    postCount: 4,
    translations: {
      tr: { name: "Ajans hikâyeleri", description: "Ajanslar Kitravo ile nasıl daha hızlı teslim ediyor." },
      de: { name: "Agentur-Geschichten", description: "Wie Agenturen mit Kitravo schneller liefern." },
      ar: { name: "قصص الوكالات", description: "كيف تُسلّم الوكالات أسرع مع Kitravo." },
      zh: { name: "代理商故事", description: "代理商如何借助 Kitravo 更快交付。" },
    },
  },
  {
    id: "c4",
    name: "Accessibility",
    slug: "accessibility",
    description: "WCAG, BITV and inclusive design notes.",
    color: "#9a4fb8",
    postCount: 5,
    translations: {
      tr: { name: "Erişilebilirlik", description: "WCAG, BITV ve kapsayıcı tasarım notları." },
      de: { name: "Barrierefreiheit", description: "Notizen zu WCAG, BITV und inklusivem Design." },
      ar: { name: "إمكانية الوصول", description: "ملاحظات حول WCAG وBITV والتصميم الشامل." },
      zh: { name: "无障碍", description: "关于 WCAG、BITV 和包容性设计的笔记。" },
    },
  },
  {
    id: "c5",
    name: "Performance",
    slug: "performance",
    description: "Core Web Vitals and caching.",
    color: "#c8432f",
    postCount: 3,
    translations: {
      tr: { name: "Performans", description: "Core Web Vitals ve önbellekleme." },
      de: { name: "Performance", description: "Core Web Vitals und Caching." },
      ar: { name: "الأداء", description: "مؤشرات Core Web Vitals والتخزين المؤقت." },
      zh: { name: "性能", description: "Core Web Vitals 与缓存。" },
    },
  },
];

export const tags: Tag[] = [
  { id: "t1", name: "CMS", slug: "cms", postCount: 11 },
  { id: "t2", name: "Site sets", slug: "site-sets", postCount: 4 },
  { id: "t3", name: "Content blocks", slug: "content-blocks", postCount: 7 },
  { id: "t4", name: "BITV 2.0", slug: "bitv-2-0", postCount: 3 },
  { id: "t5", name: "Core Web Vitals", slug: "core-web-vitals", postCount: 5 },
  { id: "t6", name: "Nordform", slug: "nordform", postCount: 6 },
  { id: "t7", name: "Migration", slug: "migration", postCount: 4 },
  { id: "t8", name: "Headless", slug: "headless", postCount: 2 },
];

/** [title, excerpt] in one language. */
type Text = [title: string, excerpt: string];

type Seed = {
  status: Post["status"];
  categoryId: string | null;
  tags: string[];
  /** The language the post was written in; defaults to English. */
  source?: Locale;
  text: Partial<Record<Locale, Text>>;
};

/**
 * Demo posts. Most were written in English and translated into some of the
 * other languages; one was written in German and has no English version yet.
 * Missing languages show up as gaps in the panel and are not listed on that
 * language's blog.
 */
const seeds: Seed[] = [
  {
    status: "published",
    categoryId: "c1",
    tags: ["t1", "t7"],
    text: {
      en: ["Moving a website without losing a weekend", "Plan the content transfer, redirects and launch checks so the switch takes an afternoon instead of a weekend."],
      tr: ["Hafta sonunuzu feda etmeden site taşıma", "İçerik aktarımını, yönlendirmeleri ve yayın kontrollerini planlayın; geçiş bir hafta sonu yerine bir öğleden sonra sürsün."],
      de: ["Eine Website umziehen, ohne ein Wochenende zu opfern", "Inhaltsübernahme, Weiterleitungen und Launch-Checks so planen, dass der Wechsel einen Nachmittag statt eines Wochenendes dauert."],
      ar: ["نقل موقع ويب دون خسارة عطلة نهاية الأسبوع", "خطّط لنقل المحتوى وإعادة التوجيه وفحوصات الإطلاق ليتم الانتقال خلال ظهيرة واحدة بدلًا من عطلة نهاية أسبوع."],
      zh: ["迁移网站，不用搭上一个周末", "提前规划内容迁移、重定向和上线检查，让切换只需一个下午，而不是整个周末。"],
    },
  },
  {
    status: "published",
    categoryId: "c2",
    tags: ["t6"],
    text: {
      en: ["Nordform 2.4: dark mode, faster menus and a new hero", "Dark mode that follows the visitor, menus that open in half the time and a hero built for real photography."],
      tr: ["Nordform 2.4: koyu mod, daha hızlı menüler ve yeni bir hero", "Ziyaretçiye uyum sağlayan koyu mod, yarı sürede açılan menüler ve gerçek fotoğraflar için tasarlanmış bir hero alanı."],
      de: ["Nordform 2.4: Dark Mode, schnellere Menüs und ein neuer Hero", "Ein Dark Mode, der sich nach den Besuchern richtet, Menüs, die doppelt so schnell öffnen, und ein Hero für echte Fotografie."],
      ar: ["Nordform 2.4: وضع داكن وقوائم أسرع وواجهة رئيسية جديدة", "وضع داكن يتبع تفضيل الزائر، وقوائم تُفتح في نصف الوقت، وواجهة رئيسية مصممة للصور الحقيقية."],
      zh: ["Nordform 2.4：深色模式、更快的菜单和全新首屏", "跟随访客偏好的深色模式、打开速度快一倍的菜单，以及为真实摄影作品打造的首屏。"],
    },
  },
  {
    status: "review",
    categoryId: "c1",
    tags: ["t3", "t1"],
    text: {
      en: ["Content blocks vs. classic content elements", "When the new content blocks are worth it, and when the classic elements are still the better tool."],
      tr: ["Content Blocks mu, klasik içerik öğeleri mi?", "Yeni Content Blocks ne zaman değer, klasik öğeler ne zaman hâlâ daha iyi bir araç?"],
    },
  },
  {
    status: "scheduled",
    categoryId: "c4",
    tags: ["t4"],
    text: {
      en: ["What BITV 2.0 means for public sector themes", "The accessibility rules German public bodies now have to meet, and what changes in a theme because of them."],
      de: ["Was BITV 2.0 für Themes im öffentlichen Sektor bedeutet", "Die Barrierefreiheitsregeln, die öffentliche Stellen in Deutschland jetzt erfüllen müssen – und was sich dadurch in einem Theme ändert."],
    },
  },
  {
    status: "published",
    categoryId: "c5",
    tags: ["t5"],
    text: {
      en: ["Shaving 800 ms off LCP on a news portal", "Preloading the right image, dropping one font weight and caching the header: three changes, 800 ms."],
      tr: ["Bir haber portalında LCP'den 800 ms kazanmak", "Doğru görseli önceden yüklemek, bir font ağırlığını kaldırmak ve başlığı önbelleğe almak: üç değişiklik, 800 ms."],
      de: ["800 ms weniger LCP auf einem Nachrichtenportal", "Das richtige Bild vorladen, einen Schriftschnitt streichen und den Header cachen: drei Änderungen, 800 ms."],
      ar: ["توفير 800 مللي ثانية من LCP في بوابة إخبارية", "تحميل الصورة الصحيحة مسبقًا، والاستغناء عن وزن خط واحد، وتخزين الترويسة مؤقتًا: ثلاثة تغييرات، 800 مللي ثانية."],
      zh: ["为新闻门户的 LCP 缩短 800 毫秒", "预加载正确的图片、去掉一个字重、缓存页头：三处改动，节省 800 毫秒。"],
    },
  },
  {
    status: "draft",
    categoryId: "c3",
    tags: [],
    source: "de",
    text: {
      de: ["Wie Studio Kranich 14 Websites in einem Quartal gelauncht hat", "Ein Studio mit drei Leuten, ein gemeinsames Basis-Theme und ein Launch pro Woche – ein ganzes Quartal lang."],
    },
  },
  {
    status: "published",
    categoryId: "c1",
    tags: ["t2", "t1"],
    text: {
      en: ["Site sets explained with three real configs", "Group shared site settings into reusable sets. Three configs from client projects show how to structure them."],
      tr: ["Üç gerçek yapılandırmayla site ayar setleri", "Ortak site ayarlarını yeniden kullanılabilir setlerde toplayın. Müşteri projelerinden üç yapılandırma, bunların nasıl kurgulanacağını gösteriyor."],
      de: ["Website-Einstellungssets an drei echten Beispielen", "Gemeinsame Website-Einstellungen in wiederverwendbaren Sets bündeln. Drei Konfigurationen aus Kundenprojekten zeigen den Aufbau."],
      zh: ["用三个真实配置讲清网站设置集", "将共享的网站设置整理为可复用的集合。来自客户项目的三个配置展示了如何组织它们。"],
    },
  },
  {
    status: "published",
    categoryId: "c2",
    tags: [],
    text: {
      en: ["Foundation theme 1.2 release notes", "Better image cropping, a new footer layout and fixes for long German compound words in headings."],
      tr: ["Foundation teması 1.2 sürüm notları", "Daha iyi görsel kırpma, yeni bir alt bilgi düzeni ve başlıklardaki uzun Almanca bileşik kelimeler için düzeltmeler."],
      de: ["Foundation-Theme 1.2: Versionshinweise", "Besserer Bildzuschnitt, ein neues Footer-Layout und Korrekturen für lange deutsche Komposita in Überschriften."],
    },
  },
  {
    status: "draft",
    categoryId: "c1",
    tags: ["t8"],
    text: {
      en: ["Headless CMS with Next.js: the honest trade-offs", "What you gain with a Next.js front end, what you give up, and the projects where it pays off."],
    },
  },
  {
    status: "review",
    categoryId: "c4",
    tags: ["t4"],
    text: {
      en: ["Focus states your QA team will thank you for", "Visible focus is the cheapest accessibility win there is. These are the patterns that survive QA."],
    },
  },
  {
    status: "scheduled",
    categoryId: "c2",
    tags: [],
    text: {
      en: ["Campus theme: building faculty pages that scale", "Faculty pages that stay consistent when 40 departments edit their own content."],
      de: ["Campus-Theme: Fakultätsseiten, die mitwachsen", "Fakultätsseiten, die einheitlich bleiben, auch wenn 40 Institute ihre Inhalte selbst pflegen."],
    },
  },
  {
    status: "draft",
    categoryId: "c5",
    tags: ["t5", "t1"],
    text: {
      en: ["Caching strategies for multilingual websites", "Per-language cache tags, warm-up after deploy and the one header that breaks everything."],
    },
  },
  {
    status: "published",
    categoryId: "c3",
    tags: [],
    text: {
      en: ["From agency brief to launch in 21 days", "The week-by-week plan we used to go from signed brief to a live site in 21 days."],
      tr: ["Ajans brifinden yayına 21 günde", "İmzalı briften yayındaki bir siteye 21 günde ulaşmak için kullandığımız haftalık plan."],
      de: ["Vom Agentur-Briefing zum Launch in 21 Tagen", "Der Wochenplan, mit dem wir vom unterschriebenen Briefing in 21 Tagen zur Live-Website kamen."],
      ar: ["من موجز الوكالة إلى الإطلاق في 21 يومًا", "الخطة الأسبوعية التي اتبعناها للانتقال من موجز موقّع إلى موقع منشور خلال 21 يومًا."],
    },
  },
  {
    status: "published",
    categoryId: "c4",
    tags: [],
    text: {
      en: ["Writing alt text editors will actually fill in", "Editors skip alt text when the field asks too much. Here is wording and help text that gets it filled in."],
      tr: ["Editörlerin gerçekten dolduracağı alt metinler", "Alan çok şey istediğinde editörler alt metni atlar. İşte doldurulmasını sağlayan ifadeler ve yardım metinleri."],
      de: ["Alt-Texte, die Redakteure wirklich ausfüllen", "Redakteure überspringen Alt-Texte, wenn das Feld zu viel verlangt. Mit diesen Formulierungen und Hilfetexten wird es ausgefüllt."],
      ar: ["نص بديل سيكتبه المحررون فعلًا", "يتجاهل المحررون النص البديل عندما يطلب الحقل الكثير. إليك صياغة ونص مساعدة يضمنان تعبئته."],
    },
  },
  {
    status: "review",
    categoryId: "c1",
    tags: ["t7"],
    text: {
      en: ["Upgrading extensions: a checklist that holds up", "Check compatibility, read the changelog, test on a copy: a checklist for extension upgrades that holds up."],
    },
  },
  {
    status: "draft",
    categoryId: "c2",
    tags: ["t6"],
    text: {
      en: ["Nordform 2.5 preview: mega menus", "Mega menus with previews, keyboard support and no layout shift, coming in the next release."],
    },
  },
  {
    status: "published",
    categoryId: "c5",
    tags: ["t5"],
    text: {
      en: ["Image formats in 2026: AVIF, WebP and when to stop", "AVIF is smaller, WebP is safer, and past a certain point neither matters. Where that point is."],
      tr: ["2026'da görsel formatları: AVIF, WebP ve nerede durmalı", "AVIF daha küçük, WebP daha güvenli; belli bir noktadan sonra ikisi de fark etmez. O nokta nerede?"],
      de: ["Bildformate 2026: AVIF, WebP und wann es reicht", "AVIF ist kleiner, WebP sicherer, und ab einem gewissen Punkt spielt beides keine Rolle mehr. Wo dieser Punkt liegt."],
      zh: ["2026 年的图片格式：AVIF、WebP，以及何时适可而止", "AVIF 更小，WebP 更稳妥，而过了某个临界点，两者都无关紧要了。这个临界点在哪里？"],
    },
  },
  {
    status: "published",
    categoryId: "c3",
    tags: [],
    text: {
      en: ["Running a web agency on three people", "Fewer projects, longer relationships and a shared kit: how a small agency stays profitable."],
      tr: ["Üç kişiyle bir web ajansı yürütmek", "Daha az proje, daha uzun ilişkiler ve ortak bir kit: küçük bir ajans nasıl kârlı kalır?"],
    },
  },
];

const authors = ["Musa Yazlık", "Lena Hoffmann", "Jonas Weber"];

const day = 24 * 60 * 60 * 1000;
const base = Date.UTC(2026, 9, 18, 9, 0);

/**
 * Turkish and German slugs are transliterated from their own titles. Arabic
 * and Chinese titles have no Latin form, so they keep the source slug; the
 * language prefix (`/ar/blog/…`) already tells the versions apart.
 */
function translationsOf(seed: Seed): Post["translations"] {
  const source = seed.source ?? "en";
  const sourceSlug = slugify(seed.text[source]![0]);
  return Object.fromEntries(
    Object.entries(seed.text).map(([locale, [title, excerpt]]) => [
      locale,
      { title, excerpt, slug: localeInfo[locale as Locale].latinSlugs ? slugify(title) : sourceSlug } satisfies PostContent,
    ]),
  );
}

export const posts: Post[] = seeds.map((seed, index) => {
  const updated = new Date(base - index * 1.7 * day).toISOString();
  const { status } = seed;
  return {
    id: `p${index + 1}`,
    status,
    categoryId: seed.categoryId,
    tags: seed.tags,
    author: authors[index % authors.length],
    featured: index === 1 || index === 4,
    readingTime: 4 + ((index * 3) % 9),
    views: status === "published" ? 420 + ((index * 7919) % 6800) : 0,
    seoScore: 48 + ((index * 37) % 50),
    updatedAt: updated,
    publishedAt: status === "published" ? updated : null,
    scheduledAt: status === "scheduled" ? new Date(base + (index + 2) * day).toISOString() : null,
    sourceLocale: seed.source ?? "en",
    translations: translationsOf(seed),
  };
});

export function getPost(id: string) {
  return posts.find((post) => post.id === id) ?? null;
}

export function getCategory(id: string | null) {
  return categories.find((category) => category.id === id) ?? null;
}
