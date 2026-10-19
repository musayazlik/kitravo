import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Landing } from "@/features/landing";
import { fill } from "@/i18n/format";
import { getI18n, localizedAlternates } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { absolute: fill(t.site.homeTitle, { name: siteConfig.name }) },
    description: `${t.site.description} ${siteConfig.githubUrl ? t.site.homeReleased : t.site.homePreparing}`,
    alternates: await localizedAlternates("/"),
  };
}

export default function Home() {
  return <Landing />;
}
