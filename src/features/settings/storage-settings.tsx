"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/i18n/provider";
import { rich } from "@/i18n/rich";
import { workspace } from "@/lib/mock-session";
import { SettingsSection } from "./components/settings-section";

export function StorageSettings() {
  const [webp, setWebp] = useState(true);
  const [quality, setQuality] = useState([82]);
  const { usedMb, limitMb } = workspace.storage;
  const { t, f } = useI18n();
  const copy = t.settings.storage;

  return (
    <SettingsSection title={copy.title} description={copy.description} saveLabel={copy.save}>
      <div className="grid gap-3 rounded-xl border p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="size-4 text-signal" /> {copy.connected}
        </div>
        <Progress value={(usedMb / limitMb) * 100} aria-label={copy.used} className="h-2" />
        <p className="tabular text-sm text-muted-foreground">
          {rich(copy.usage, {
            used: f.bytes(usedMb * 1024 ** 2),
            limit: f.bytes(limitMb * 1024 ** 2),
            token: <code className="font-mono text-xs">UPLOADTHING_TOKEN</code>,
          })}
        </p>
      </div>

      <FieldGroup className="gap-5">
        <Field orientation="horizontal" className="rounded-lg border p-3">
          <div className="grid flex-1 gap-1">
            <FieldLabel htmlFor="webp">{copy.webp}</FieldLabel>
            <FieldDescription>{copy.webpHelp}</FieldDescription>
          </div>
          <Switch id="webp" checked={webp} onCheckedChange={setWebp} />
        </Field>
        <Field data-disabled={!webp}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="quality">{copy.quality}</FieldLabel>
            <span className="tabular text-sm text-muted-foreground">{quality[0]}</span>
          </div>
          <Slider id="quality" min={50} max={100} step={1} value={quality} onValueChange={setQuality} disabled={!webp} aria-label={copy.quality} />
          <FieldDescription>{copy.qualityHelp}</FieldDescription>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="max-width">{copy.maxWidth}</FieldLabel>
            <Select defaultValue="2400">
              <SelectTrigger id="max-width" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1600", "2000", "2400", "3200"].map((width) => (
                  <SelectItem key={width} value={width}>
                    {f.number(Number(width))} px
                  </SelectItem>
                ))}
                <SelectItem value="0">{copy.keep}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="max-size">{copy.maxSize}</FieldLabel>
            <Select defaultValue="64">
              <SelectTrigger id="max-size" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["8", "16", "32", "64"].map((size) => (
                  <SelectItem key={size} value={size}>
                    {f.bytes(Number(size) * 1024 ** 2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FieldGroup>
    </SettingsSection>
  );
}
