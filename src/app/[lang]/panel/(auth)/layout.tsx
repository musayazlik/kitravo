import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/config/site";
import { RegistrationMark } from "@/features/auth/registration-mark";
import { getDictionary } from "@/i18n/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getDictionary();

  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-10 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex w-fit items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <LogoMark className="size-8" />
            <span className="font-heading text-lg font-semibold">{siteConfig.name}</span>
          </Link>
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <main className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-12">{children}</main>
        <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {t.auth.backToSite}
        </Link>
      </div>
      <div className="relative hidden overflow-hidden border-s bg-paper lg:block" aria-hidden>
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:64px_64px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <RegistrationMark />
      </div>
    </div>
  );
}
