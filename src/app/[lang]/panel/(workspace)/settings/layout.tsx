import { Main, PageHeader } from "@/components/layout/page-header";
import { SettingsNav } from "@/features/settings/components/settings-nav";
import { getDictionary } from "@/i18n/server";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const t = await getDictionary();

  return (
    <Main>
      <PageHeader title={t.settings.title} description={t.settings.description} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
        <aside>
          <SettingsNav />
        </aside>
        <div className="max-w-2xl min-w-0">{children}</div>
      </div>
    </Main>
  );
}
