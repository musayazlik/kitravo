"use client";

import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { rich } from "@/i18n/rich";

const RESEND_AFTER = 45;

/**
 * Six-digit email code after sign-up. Wire to Better Auth's email OTP plugin
 * (`emailOtp.verifyEmail` and `sendVerificationOtp`).
 */
export function VerifyEmail() {
  const router = useRouter();
  const { t } = useI18n();
  const copy = t.auth.verify;
  const email = useSearchParams().get("email") ?? copy.yourEmail;
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_AFTER);

  useEffect(() => {
    if (wait === 0) return;
    const timer = setTimeout(() => setWait((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const verify = async (value: string) => {
    setBusy(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setBusy(false);
    // Demo rule: any code except 000000 passes.
    if (value === "000000") {
      setError(copy.wrong);
      setCode("");
      return;
    }
    toast.success(copy.confirmed);
    router.push("/panel/dashboard");
  };

  return (
    <div className="grid gap-6">
      <div className="grid justify-items-start gap-3">
        <span className="grid size-11 place-items-center rounded-sm bg-ink-soft text-ink">
          <MailCheck className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold">{copy.title}</h1>
        <p className="text-muted-foreground">
          {rich(copy.sent, { b: (chunks) => <span className="font-medium break-all text-foreground">{chunks}</span>, email })}
        </p>
      </div>

      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.length === 6) verify(code);
        }}
      >
        <motion.div
          // A wrong code shakes the boxes once, so the error is felt where you were typing.
          key={error}
          animate={error ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
          transition={{ duration: 0.4 }}
        >
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => {
              setCode(value);
              setError("");
            }}
            onComplete={verify}
            disabled={busy}
            aria-label={copy.code}
            aria-invalid={!!error}
            // Codes are typed left to right in every language.
            containerClassName="justify-start"
            dir="ltr"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-11 text-lg" />
              <InputOTPSlot index={1} className="size-11 text-lg" />
              <InputOTPSlot index={2} className="size-11 text-lg" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="size-11 text-lg" />
              <InputOTPSlot index={4} className="size-11 text-lg" />
              <InputOTPSlot index={5} className="size-11 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </motion.div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="h-10" disabled={busy || code.length < 6}>
          {busy && <Spinner />}
          {busy ? copy.checking : copy.confirm}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {copy.noEmail}{" "}
        {wait > 0 ? (
          <span className="tabular">{fill(copy.wait, { seconds: wait })}</span>
        ) : (
          <button
            type="button"
            className="text-ink underline-offset-4 hover:underline"
            onClick={() => {
              setWait(RESEND_AFTER);
              toast.success(fill(copy.resent, { email }));
            }}
          >
            {copy.resend}
          </button>
        )}{" "}
        <Link href="/panel/sign-up" className="text-ink underline-offset-4 hover:underline">
          {t.auth.anotherEmail}
        </Link>
      </p>
    </div>
  );
}
