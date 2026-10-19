import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono, Noto_Sans_Arabic } from "next/font/google";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import { localeInfo, locales } from "@/i18n/config";
import { dictionaryFor } from "@/i18n/dictionary";
import { getI18n, getLocale } from "@/i18n/server";
import "../globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

/** Only Arabic pages ask for it (see `globals.css`), so it is not preloaded everywhere. */
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  preload: false,
});

/** Every language is prerendered; Cache Components needs at least one value per root param. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
    applicationName: siteConfig.name,
    description: t.site.description,
    metadataBase: new URL(siteConfig.url),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={localeInfo[locale].dir}
      suppressHydrationWarning
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} ${notoArabic.variable} h-full`}
    >
      <body className="min-h-full">
        <Providers locale={locale} dictionary={dictionaryFor(locale)}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
