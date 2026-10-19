"use client";

import { useState } from "react";
import { ChevronRight, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultLocale, localeInfo, locales } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import type { Category } from "../data/schema";

export type Term = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  color?: string;
  description?: string;
  /** Categories only: name and description in the other languages. */
  translations?: Category["translations"];
};

const PALETTE = ["#3d41d6", "#12876c", "#e39a2d", "#9a4fb8", "#c8432f", "#7b8195"];

/** Languages a category can be translated into: every one except the default, which `name` holds. */
const OTHER_LOCALES = locales.filter((locale) => locale !== defaultLocale);

/**
 * Create or edit a category (name, slug, description, colour, translations)
 * or a tag (name, slug).
 */
export function TermDialog({
  term,
  withDetails,
  kind,
  onClose,
  onSave,
}: {
  term: Term | null;
  withDetails: boolean;
  kind: "category" | "tag";
  onClose: () => void;
  onSave: (term: Term) => void;
}) {
  const { t, f } = useI18n();
  const copy = t.posts.term;
  const [name, setName] = useState(term?.name ?? "");
  const [slug, setSlug] = useState(term?.slug ?? "");
  const [description, setDescription] = useState(term?.description ?? "");
  const [color, setColor] = useState(term?.color ?? PALETTE[0]);
  const [translations, setTranslations] = useState<NonNullable<Term["translations"]>>(term?.translations ?? {});

  const title = term ? (kind === "category" ? copy.editCategory : copy.editTag) : kind === "category" ? copy.newCategory : copy.newTag;
  const submitLabel = term ? copy.save : kind === "category" ? copy.createCategory : copy.createTag;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            // Empty translations fall back to the default language, so they are not stored.
            const filled = Object.fromEntries(Object.entries(translations).filter(([, text]) => text?.name.trim()));
            onSave({
              id: term?.id ?? `new-${Date.now()}`,
              name,
              slug: slug || slugify(name),
              postCount: term?.postCount ?? 0,
              ...(withDetails ? { description, color, translations: filled } : {}),
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="term-name">{copy.name}</FieldLabel>
                <Input
                  id="term-name"
                  required
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (!term) setSlug(slugify(event.target.value));
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="term-slug">{copy.slug}</FieldLabel>
                <Input id="term-slug" dir="ltr" className="font-mono text-sm" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} />
              </Field>
              {withDetails && (
                <>
                  <Field>
                    <FieldLabel htmlFor="term-description">{copy.details}</FieldLabel>
                    <Textarea id="term-description" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
                    <FieldDescription>{copy.detailsHelp}</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel id="term-color">{copy.colour}</FieldLabel>
                    <div role="radiogroup" aria-labelledby="term-color" className="flex gap-2">
                      {PALETTE.map((swatch) => (
                        <button
                          key={swatch}
                          type="button"
                          role="radio"
                          aria-checked={color === swatch}
                          aria-label={swatch}
                          onClick={() => setColor(swatch)}
                          className={cn(
                            "size-8 rounded-full ring-offset-2 ring-offset-background transition-transform outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            color === swatch ? "scale-110 ring-2 ring-foreground" : "hover:scale-105",
                          )}
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                    </div>
                  </Field>

                  <Collapsible className="group/translations rounded-sm border">
                    <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Languages className="size-4 text-muted-foreground" />
                      {copy.translations}
                      <span className="ms-auto text-xs font-normal text-muted-foreground tabular-nums">
                        {OTHER_LOCALES.filter((locale) => translations[locale]?.name.trim()).length}/{OTHER_LOCALES.length}
                      </span>
                      <ChevronRight className="size-4 transition-transform group-data-[state=open]/translations:rotate-90 rtl:group-data-[state=open]/translations:-rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="grid gap-4 border-t px-3 py-3">
                      <p className="text-xs text-muted-foreground">{fill(copy.translationsHelp, { language: f.language(defaultLocale) })}</p>
                      {OTHER_LOCALES.map((locale) => (
                        <fieldset key={locale} className="grid gap-2" lang={locale} dir={localeInfo[locale].dir}>
                          <legend className="mb-1 text-xs font-medium text-muted-foreground">{localeInfo[locale].name}</legend>
                          <Input
                            aria-label={`${copy.name} · ${localeInfo[locale].name}`}
                            placeholder={name}
                            value={translations[locale]?.name ?? ""}
                            onChange={(event) =>
                              setTranslations((current) => ({ ...current, [locale]: { ...current[locale], name: event.target.value } }))
                            }
                          />
                          <Textarea
                            aria-label={`${copy.details} · ${localeInfo[locale].name}`}
                            placeholder={description}
                            rows={2}
                            value={translations[locale]?.description ?? ""}
                            onChange={(event) =>
                              setTranslations((current) => ({ ...current, [locale]: { name: current[locale]?.name ?? "", description: event.target.value } }))
                            }
                          />
                        </fieldset>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}
            </FieldGroup>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
