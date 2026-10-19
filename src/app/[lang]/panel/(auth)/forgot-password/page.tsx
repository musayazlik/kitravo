import { AuthForm } from "@/features/auth/auth-form";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.auth.meta.forgot);

export default function Page() {
  return <AuthForm mode="forgot-password" />;
}
