"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { PasswordStrength } from "./password-strength";
import { authClient } from "@/lib/auth-client";
import { PANEL_HOME } from "@/config/routes";
import type { Dictionary } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/provider";
import { rich } from "@/i18n/rich";

type Mode = "sign-in" | "sign-up" | "forgot-password" | "reset-password";

/** Which `t.auth.modes` entry titles each screen. */
const MODE_KEY = { "sign-in": "signIn", "sign-up": "signUp", "forgot-password": "forgot", "reset-password": "reset" } as const;

/** Validation per screen, with messages in the interface language. */
function schemaFor(mode: Mode, messages: Dictionary["auth"]["validation"]) {
  const password = z.string().min(10, messages.passwordMin);
  switch (mode) {
    case "sign-in":
      return z.object({ email: z.email(messages.signInEmail), password: z.string().min(1, messages.passwordRequired) });
    case "sign-up":
      return z.object({ name: z.string().trim().min(2, messages.name), email: z.email(messages.email), password });
    case "forgot-password":
      return z.object({ email: z.email(messages.signInEmail) });
    case "reset-password":
      return z
        .object({ password, confirm: z.string() })
        .refine((values) => values.password === values.confirm, { message: messages.mismatch, path: ["confirm"] });
  }
}

type Values = { name?: string; email?: string; password?: string; confirm?: string };

function PasswordInput({ id, autoComplete, invalid, ...props }: { id: string; autoComplete: string; invalid: boolean } & UseFormRegisterReturn) {
  const [show, setShow] = useState(false);
  const { t } = useI18n();
  return (
    <InputGroup>
      <InputGroupInput id={id} type={show ? "text" : "password"} autoComplete={autoComplete} aria-invalid={invalid} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" onClick={() => setShow((value) => !value)} aria-label={show ? t.auth.hidePassword : t.auth.showPassword}>
          {show ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

/**
 * Email sign-in/sign-up use Better Auth; recovery awaits an email provider.
 */
export function AuthForm({ mode, demoEnabled = true, returnTo = PANEL_HOME }: { mode: Mode; demoEnabled?: boolean; returnTo?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [demoPending, setDemoPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [schema] = useState(() => schemaFor(mode, t.auth.validation));
  const { register, handleSubmit, formState, control } = useForm<Values>({
    resolver: zodResolver(schema as unknown as z.ZodType<Values, Values>),
  });
  const copy = t.auth;
  const text = copy.modes[MODE_KEY[mode]];
  const typedPassword = useWatch({ control, name: "password" }) ?? "";
  const errors = formState.errors;

  const onSubmit = async (values: Values) => {
    setServerError(null);
    try {
      if (mode === "forgot-password" || mode === "reset-password") {
        setServerError(copy.recoveryUnavailable);
        return;
      }
      const result = mode === "sign-up"
        ? await authClient.signUp.email({ name: values.name!, email: values.email!, password: values.password! })
        : await authClient.signIn.email({ email: values.email!, password: values.password!, rememberMe: remember });
      if (result.error) return setServerError(result.error.message ?? t.access.error);
      router.push(returnTo);
      router.refresh();
    } catch { setServerError(t.access.error); }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sentTo !== null ? (
        <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid justify-items-start gap-3" role="status">
          <span className="grid size-11 place-items-center rounded-sm bg-signal-soft text-signal-foreground">
            <MailCheck className="size-5" />
          </span>
          <h1 className="text-3xl font-semibold">{copy.checkInbox}</h1>
          <p className="text-muted-foreground">
            {rich(copy.resetSent, { b: (chunks) => <span className="font-medium text-foreground">{chunks}</span>, email: sentTo })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/panel/sign-in">{copy.backToSignIn}</Link>
            </Button>
            <Button variant="ghost" onClick={() => setSentTo(null)}>
              {copy.anotherEmail}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-6"
          noValidate
        >
          <div className="grid gap-1.5">
            <h1 className="text-3xl font-semibold">{text.title}</h1>
            <p className="text-muted-foreground">{text.description}</p>
          </div>

          {(mode === "sign-in" || mode === "sign-up") && (
            <>
              {mode === "sign-in" && demoEnabled && <div className="grid gap-2">
                <Button type="button" variant="outline" className="h-10" disabled={demoPending || formState.isSubmitting} onClick={async () => {
                  setDemoPending(true);
                  setServerError(null);
                  try {
                    const result = await authClient.signIn.anonymous();
                    if (result.error) setServerError(result.error.message ?? t.access.error);
                    else { router.push(returnTo); router.refresh(); }
                  } catch { setServerError(t.access.error); }
                  finally { setDemoPending(false); }
                }}>{demoPending ? <Spinner /> : null}{t.access.demo}</Button>
                <p className="text-xs text-muted-foreground">{t.access.demoNote}</p>
              </div>}
            </>
          )}

          {serverError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
          <FieldGroup className="gap-4">
            {mode === "sign-up" && (
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">{copy.fullName}</FieldLabel>
                <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>
            )}
            {mode !== "reset-password" && (
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">{copy.email}</FieldLabel>
                <Input id="email" type="email" dir="ltr" autoComplete="email" placeholder={copy.emailPlaceholder} aria-invalid={!!errors.email} {...register("email")} />
                <FieldError errors={[errors.email]} />
              </Field>
            )}
            {mode !== "forgot-password" && (
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">{mode === "reset-password" ? copy.newPassword : copy.password}</FieldLabel>
                  {mode === "sign-in" && (
                    <Link href="/panel/forgot-password" className="text-sm text-ink underline-offset-4 hover:underline">
                      {copy.forgot}
                    </Link>
                  )}
                </div>
                <PasswordInput
                  id="password"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  invalid={!!errors.password}
                  {...register("password")}
                />
                {mode !== "sign-in" && <PasswordStrength value={typedPassword} />}
                <FieldError errors={[errors.password]} />
              </Field>
            )}
            {mode === "reset-password" && (
              <Field data-invalid={!!errors.confirm}>
                <FieldLabel htmlFor="confirm">{copy.repeat}</FieldLabel>
                <PasswordInput id="confirm" autoComplete="new-password" invalid={!!errors.confirm} {...register("confirm")} />
                <FieldError errors={[errors.confirm]} />
              </Field>
            )}
            {mode === "sign-in" && (
              <Field orientation="horizontal">
                <Checkbox id="remember" checked={remember} onCheckedChange={(checked) => setRemember(checked === true)} />
                <FieldLabel htmlFor="remember" className="font-normal">
                  {copy.remember}
                </FieldLabel>
              </Field>
            )}
            {mode === "sign-up" && (
              <FieldDescription>{copy.terms}</FieldDescription>
            )}
          </FieldGroup>

          <Button type="submit" size="lg" className="h-10" disabled={formState.isSubmitting || demoPending}>
            {formState.isSubmitting && <Spinner />}
            {formState.isSubmitting ? text.busy : text.submit}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "sign-in" ? (
              <>
                {copy.newHere}{" "}
                <Link href="/panel/sign-up" className="text-ink underline-offset-4 hover:underline">
                  {copy.createAccount}
                </Link>
              </>
            ) : (
              <>
                {mode === "sign-up" ? copy.haveAccount : copy.remembered}{" "}
                <Link href="/panel/sign-in" className="text-ink underline-offset-4 hover:underline">
                  {copy.signIn}
                </Link>
              </>
            )}
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
