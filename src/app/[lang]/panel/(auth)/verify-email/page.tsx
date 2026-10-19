import { Suspense } from "react";
import { VerifyEmail } from "@/features/auth/verify-email";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.auth.meta.verify);

export default function Page() {
  // The address comes from ?email=, which is URL data, so it streams in.
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
