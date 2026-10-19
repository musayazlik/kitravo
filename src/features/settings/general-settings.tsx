"use client";

import { Languages } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { fill } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { SettingsSection } from "./components/settings-section";

export function GeneralSettings() {
  const { t } = useI18n();
  const copy = t.settings.general;

  return (
    <SettingsSection title={copy.title} description={copy.description} saveLabel={copy.save}>
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="site-name">{copy.siteName}</FieldLabel>
          <Input id="site-name" defaultValue={siteConfig.name} />
        </Field>
        <Link
          href="/panel/settings/languages"
          className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-ink hover:text-ink"
        >
          <Languages className="size-4 shrink-0" /> {copy.languagesLink}
        </Link>
        <Field>
          <FieldLabel htmlFor="site-url">{copy.url}</FieldLabel>
          <Input id="site-url" type="url" dir="ltr" defaultValue="https://kitravo.com" />
          <FieldDescription>{copy.urlHelp}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="tagline">{copy.tagline}</FieldLabel>
          <Textarea id="tagline" rows={2} defaultValue={copy.taglineDefault} />
          <FieldDescription>{copy.taglineHelp}</FieldDescription>
        </Field>
        <FieldSet>
          <FieldLegend variant="label">{copy.social}</FieldLegend>
          <FieldDescription>{copy.socialHelp}</FieldDescription>
          <div className="grid gap-3">
            {[
              ["X", "x.com/", "kitravo"],
              ["LinkedIn", "linkedin.com/company/", "kitravo"],
              ["GitHub", "github.com/", "kitravo"],
            ].map(([network, prefix, value]) => (
              <InputGroup key={network} dir="ltr">
                <InputGroupAddon className="w-36 justify-start text-xs">{prefix}</InputGroupAddon>
                <InputGroupInput aria-label={fill(copy.handle, { network })} defaultValue={value} />
              </InputGroup>
            ))}
          </div>
        </FieldSet>
      </FieldGroup>
    </SettingsSection>
  );
}
