import { protectPage } from "@/components/access/protected-page";
import { publishedTranslations } from "@/features/blog/data/articles";
import { posts } from "@/features/posts/data/posts";
import { LanguageSettings } from "@/features/settings/language-settings";
import { locales, type Locale } from "@/i18n/config";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.settings.languages.title);

function Page() {
  const translations = publishedTranslations();
  const coverage = Object.fromEntries(locales.map((locale) => [locale, translations.filter((entry) => entry.locale === locale).length])) as Record<Locale, number>;
  const publishedTotal = posts.filter((post) => post.status === "published").length;
  return <LanguageSettings coverage={coverage} publishedTotal={publishedTotal} />;
}

export default protectPage("settings.read", Page);
