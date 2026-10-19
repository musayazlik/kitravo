"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useSwitchLocale } from "@/components/layout/locale-switcher";
import { StatusBadge } from "@/components/status-badge";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { defaultLocale, localeInfo, locales, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./components/settings-section";

/**
 * Languages: the reader's own interface language (it switches the URL right
 * away) and the site-wide set of languages, with the default that search
 * engines and unknown visitors get. `coverage` counts published posts per
 * language; it comes from the server so the page needs no post data.
 */
export function LanguageSettings({ coverage, publishedTotal }: { coverage: Record<Locale, number>; publishedTotal: number }) {
  const { t, f, locale } = useI18n();
  const copy = t.settings.languages;
  const switchLocale = useSwitchLocale();
  const [siteDefault, setSiteDefault] = useState<Locale>(defaultLocale);
  const [live, setLive] = useState<Set<Locale>>(() => new Set(locales));

  return (
    <SettingsSection title={copy.title} description={copy.description} saveLabel={copy.save}>
      <section className="grid gap-3">
        <div className="grid gap-1">
          <h3 className="font-sans text-sm font-medium">{copy.interface}</h3>
          <p className="text-sm text-muted-foreground">{copy.interfaceHelp}</p>
        </div>
        <div role="radiogroup" aria-label={copy.interface} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {locales.map((code) => {
            const selected = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => !selected && switchLocale(code)}
                className={cn(
                  "relative grid gap-0.5 rounded-lg border p-3 text-start transition-colors outline-none hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring",
                  selected && "border-ink bg-ink-soft/40",
                )}
              >
                <span className="text-sm font-medium" lang={code}>
                  {localeInfo[code].name}
                </span>
                <span className="text-xs text-muted-foreground">{f.language(code)}</span>
                {selected && (
                  <span className="absolute top-2 end-2 grid size-5 place-items-center rounded-full bg-ink text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3">
        <div className="grid gap-1">
          <h3 className="font-sans text-sm font-medium">{copy.site}</h3>
          <p className="text-sm text-muted-foreground">{copy.defaultHelp}</p>
        </div>
        <RadioGroup value={siteDefault} onValueChange={(value) => setSiteDefault(value as Locale)} aria-label={copy.columns.default}>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>{copy.columns.language}</TableHead>
                  <TableHead>{copy.columns.url}</TableHead>
                  <TableHead className="hidden md:table-cell">{copy.columns.direction}</TableHead>
                  <TableHead className="hidden sm:table-cell">{copy.columns.coverage}</TableHead>
                  <TableHead className="text-center">{copy.columns.default}</TableHead>
                  <TableHead className="text-end">{copy.columns.enabled}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locales.map((code) => {
                  const isDefault = code === siteDefault;
                  return (
                    <TableRow key={code}>
                      <TableCell>
                        <span className="grid">
                          <span className="font-medium" lang={code}>
                            {localeInfo[code].name}
                          </span>
                          <span className="text-xs text-muted-foreground">{f.language(code)}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="font-mono text-xs text-muted-foreground" dir="ltr">
                          /{code}/…
                        </code>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusBadge tone={localeInfo[code].dir === "rtl" ? "proof" : "muted"}>{localeInfo[code].dir === "rtl" ? copy.rtl : copy.ltr}</StatusBadge>
                      </TableCell>
                      <TableCell className="hidden min-w-32 sm:table-cell">
                        <span className="grid gap-1">
                          <Progress value={(coverage[code] / Math.max(publishedTotal, 1)) * 100} className="h-1.5" aria-hidden />
                          <span className="tabular text-xs text-muted-foreground">
                            {f.number(coverage[code])} / {f.number(publishedTotal)}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <RadioGroupItem value={code} aria-label={fill(copy.defaultLabel, { language: f.language(code) })} disabled={!live.has(code)} />
                      </TableCell>
                      <TableCell className="text-end">
                        <Switch
                          checked={live.has(code)}
                          disabled={isDefault}
                          title={isDefault ? copy.defaultLocked : undefined}
                          aria-label={fill(copy.enabledLabel, { language: f.language(code) })}
                          onCheckedChange={(on) =>
                            setLive((current) => {
                              const next = new Set(current);
                              if (on) next.add(code);
                              else next.delete(code);
                              return next;
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </RadioGroup>
      </section>

      <FieldGroup className="gap-0 divide-y rounded-xl border">
        <Field orientation="horizontal" className="p-4">
          <div className="grid flex-1 gap-1">
            <FieldLabel htmlFor="detect-language">{copy.detect}</FieldLabel>
            <FieldDescription>{copy.detectHelp}</FieldDescription>
          </div>
          <Switch id="detect-language" defaultChecked />
        </Field>
        <Field orientation="horizontal" className="p-4">
          <div className="grid flex-1 gap-1">
            <FieldLabel htmlFor="fallback-posts">{copy.fallback}</FieldLabel>
            <FieldDescription>{copy.fallbackHelp}</FieldDescription>
          </div>
          <Switch id="fallback-posts" />
        </Field>
      </FieldGroup>
    </SettingsSection>
  );
}
