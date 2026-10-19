"use client";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/i18n/provider";
import { SettingsSection } from "./components/settings-section";

/** Labels and help text come from `t.settings.notifications.options`. */
const options = [
  { id: "inquiry", on: true },
  { id: "review", on: true },
  { id: "bounce", on: true },
  { id: "mcp", on: false },
  { id: "digest", on: false },
] as const;

export function NotificationSettings() {
  const { t } = useI18n();
  const copy = t.settings.notifications;

  return (
    <SettingsSection title={copy.title} description={copy.description} saveLabel={copy.save}>
      <FieldGroup className="gap-0 divide-y rounded-xl border">
        {options.map((option) => (
          <Field key={option.id} orientation="horizontal" className="p-4">
            <div className="grid flex-1 gap-1">
              <FieldLabel htmlFor={`notify-${option.id}`}>{copy.options[option.id].label}</FieldLabel>
              <FieldDescription>{copy.options[option.id].description}</FieldDescription>
            </div>
            <Switch id={`notify-${option.id}`} defaultChecked={option.on} />
          </Field>
        ))}
      </FieldGroup>
    </SettingsSection>
  );
}
