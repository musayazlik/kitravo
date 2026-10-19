import { AuthForm } from "@/features/auth/auth-form";
import { titleMetadata } from "@/i18n/server";
import { Suspense } from "react";
import { safePanelDestination } from "@/config/routes";

export const generateMetadata = titleMetadata((t) => t.auth.meta.signIn);

async function SignIn({ searchParams }: Pick<PageProps<"/[lang]/panel/sign-in">, "searchParams">) {
  const query = await searchParams;
  return <AuthForm mode="sign-in" demoEnabled={process.env.AUTH_DEMO_ENABLED !== "false"} returnTo={safePanelDestination(typeof query.next === "string" ? query.next : undefined)} />;
}
export default function Page(props: PageProps<"/[lang]/panel/sign-in">) {
  return <Suspense fallback={<div className="h-96 rounded-xl bg-paper" aria-busy="true" />}><SignIn {...props} /></Suspense>;
}
