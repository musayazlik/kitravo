"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { Main, PageHeader } from "@/components/layout/page-header";
import { LogoMark } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";
import { AnimatedTabsList } from "@/components/motion/animated-tabs";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { TimeAgo } from "@/components/time-ago";
import { useAccess } from "@/components/access/access-provider";
import { ActionButton } from "@/components/access/action-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { defaultLocale, localeInfo, locales, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { deliveryLog, templates, type LogEntry, type Template } from "./data/templates";

const logTone: Record<LogEntry["status"], Tone> = { delivered: "ink", opened: "signal", bounced: "rust" };

/** A template's text in one language, falling back to the default language. */
function textIn(template: Template, locale: Locale) {
  return template.translations[locale] ?? template.translations[defaultLocale]!;
}

export function MailPage() {
  const access = useAccess();
  const { t, f, locale } = useI18n();
  const copy = t.mail;
  const [tab, setTab] = useState("templates");
  const [items, setItems] = useState(templates);
  const [activeId, setActiveId] = useState(templates[0].id);
  // The preview starts in the interface language; each recipient gets their own.
  const [previewLocale, setPreviewLocale] = useState<Locale>(locale);
  const active = items.find((template) => template.id === activeId)!;
  const activeName = copy.templateNames[active.id];
  const text = textIn(active, previewLocale);

  return (
    <Main>
      <PageHeader
        title={t.nav.items.mail}
        description={copy.description}
        actions={
          <ActionButton permission="mail.manage" variant="outline" onClick={() => toast.success(fill(copy.testSent, { email: "musa@kitravo.com" }))}>
            <Send /> {copy.sendTest}
          </ActionButton>
        }
      />

      <Card className="flex-row flex-wrap items-center gap-4 px-5 py-4">
        <CheckCircle2 className="size-5 text-signal" aria-hidden />
        <div className="grid min-w-0 flex-1">
          <span className="text-sm font-medium">{copy.connected}</span>
          <span className="text-sm text-muted-foreground">{copy.sendingAs}</span>
        </div>
        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">{copy.sentMonth}</dt>
            <dd className="font-heading text-lg font-semibold tabular">{f.number(1284)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{copy.bounceRate}</dt>
            <dd className="font-heading text-lg font-semibold tabular">{f.percent(0.011, 1)}</dd>
          </div>
        </dl>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="gap-5">
        <AnimatedTabsList
          value={tab}
          className="w-full sm:w-fit"
          tabs={[
            { value: "templates", label: copy.tabs.templates },
            { value: "log", label: copy.tabs.log },
            { value: "settings", label: copy.tabs.settings },
          ]}
        />

        <TabsContent value="templates" className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <ul className="grid content-start gap-1" aria-label={copy.tabs.templates}>
            {items.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  aria-current={template.id === activeId}
                  onClick={() => setActiveId(template.id)}
                  className={cn(
                    "grid w-full gap-0.5 rounded-lg border border-transparent p-3 text-start transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    template.id === activeId && "border-border bg-muted",
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {copy.templateNames[template.id]}
                    {!template.enabled && (
                      <StatusBadge tone="muted" className="ms-auto h-5">
                        {copy.off}
                      </StatusBadge>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">{fill(copy.when, { trigger: copy.triggers[template.id] })}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="grid content-start gap-4">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
              <div className="grid min-w-0 flex-1">
                <span className="text-xs text-muted-foreground">{copy.subject}</span>
                <span className="truncate text-sm font-medium" lang={previewLocale} dir={localeInfo[previewLocale].dir}>
                  {fill(text.subject, { name: "Katrin Vogel" })}
                </span>
              </div>
              <label className="flex items-center gap-2 text-sm">
                {copy.sendThis}
                <Switch disabled={!access.can("mail.manage")}
                  checked={active.enabled}
                  onCheckedChange={(enabled) => {
                    setItems((current) => current.map((template) => (template.id === active.id ? { ...template, enabled } : template)));
                    toast.success(fill(enabled ? copy.turnedOn : copy.turnedOff, { name: activeName }));
                  }}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">{copy.previewLanguage}</span>
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={previewLocale}
                onValueChange={(value) => value && setPreviewLocale(value as Locale)}
                aria-label={copy.previewLanguage}
              >
                {locales.map((code) => (
                  <ToggleGroupItem key={code} value={code} title={f.language(code)} className="font-mono text-xs uppercase">
                    {code}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="basis-full text-xs text-muted-foreground">{fill(copy.languageNote, { language: f.language(defaultLocale) })}</p>
            </div>

            {/* Preview of the React Email template in the chosen language, rendered as it lands in an inbox. */}
            <div className="rounded-xl border bg-muted/50 p-4 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.id}-${previewLocale}`}
                  lang={previewLocale}
                  dir={localeInfo[previewLocale].dir}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.2 }}
                  className="mx-auto max-w-md rounded-lg bg-white p-8 text-[#161821] shadow-sm"
                >
                  <LogoMark className="size-9" />
                  <h2 className="mt-6 font-heading text-2xl font-semibold">{text.heading}</h2>
                  <p className="mt-3 text-[15px] leading-7 text-[#4a4f60]">{text.body}</p>
                  {text.cta && <span className="mt-6 inline-block rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-primary-foreground">{text.cta}</span>}
                  <p className="mt-8 border-t border-[#e3e5eb] pt-4 text-xs text-[#7b8195]" dir="ltr">
                    {siteConfig.name}, Hafenstraße 12, 20457 Hamburg
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="log">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>{copy.columns.recipient}</TableHead>
                  <TableHead>{copy.columns.template}</TableHead>
                  <TableHead>{copy.columns.language}</TableHead>
                  <TableHead>{copy.columns.status}</TableHead>
                  <TableHead className="text-end">{copy.columns.sent}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium" dir="ltr">
                      {entry.to}
                    </TableCell>
                    <TableCell>{copy.templateNames[entry.template]}</TableCell>
                    <TableCell className="text-muted-foreground">{f.language(entry.locale)}</TableCell>
                    <TableCell>
                      <StatusBadge tone={logTone[entry.status]}>{copy.status[entry.status]}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-end">
                      <TimeAgo value={entry.at} className="text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="font-heading text-lg">{copy.sender}</CardTitle>
              <CardDescription>{copy.senderHelp}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="from-name">{copy.senderName}</FieldLabel>
                    <Input id="from-name" defaultValue={siteConfig.name} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="from-email">{copy.senderAddress}</FieldLabel>
                    <Input id="from-email" type="email" dir="ltr" defaultValue="hello@kitravo.com" />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="inquiries-to">{copy.inquiriesTo}</FieldLabel>
                  <Input id="inquiries-to" type="email" dir="ltr" defaultValue="musa@kitravo.com" />
                  <FieldDescription>{copy.inquiriesHelp}</FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end">
              <ActionButton permission="mail.manage" onClick={() => toast.success(copy.senderSaved)}>{copy.saveSender}</ActionButton>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </Main>
  );
}
