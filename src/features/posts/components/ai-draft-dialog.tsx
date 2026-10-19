"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";

export type AiDraftRequest = { brief: string; tone: string; length: string; research: boolean; locale: Locale };

const TONES = ["practical", "friendly", "technical", "formal"] as const;
const LENGTHS = ["short", "medium", "long"] as const;

/**
 * Brief → draft. The real call goes to the AI writer (OpenRouter) with the
 * same prompt the MCP `ai_write_post` tool uses; here it resolves locally.
 */
export function AiDraftDialog({
  open,
  onOpenChange,
  onDraft,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDraft: (request: AiDraftRequest) => Promise<void>;
  /** The language being edited; the draft is written in it. */
  locale: Locale;
}) {
  const { t, f } = useI18n();
  const copy = t.editor.ai;
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState("practical");
  const [length, setLength] = useState("medium");
  const [research, setResearch] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    await onDraft({ brief, tone, length, research, locale });
    setBusy(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-ink" /> {copy.title}
          </DialogTitle>
          <DialogDescription>
            {copy.description} {fill(copy.languageNote, { language: f.language(locale) })}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="brief">{copy.brief}</FieldLabel>
              <Textarea
                id="brief"
                rows={4}
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                placeholder={copy.briefPlaceholder}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="tone">{copy.tone}</FieldLabel>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {copy.tones[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>{copy.length}</FieldLabel>
                <RadioGroup value={length} onValueChange={setLength} className="flex gap-4 pt-1.5">
                  {LENGTHS.map((value) => (
                    <Label key={value} className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value={value} /> {copy.lengths[value]}
                    </Label>
                  ))}
                </RadioGroup>
              </Field>
            </div>
            <Field orientation="horizontal" className="rounded-lg border p-3">
              <div className="grid flex-1 gap-1">
                <FieldLabel htmlFor="research">{copy.research}</FieldLabel>
                <FieldDescription>{copy.researchHelp}</FieldDescription>
              </div>
              <Switch id="research" checked={research} onCheckedChange={setResearch} />
            </Field>
          </FieldGroup>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {t.common.cancel}
          </Button>
          <Button onClick={submit} disabled={busy || brief.trim().length < 10}>
            {busy ? <Spinner /> : <Sparkles />}
            {busy ? (research ? copy.researching : copy.writing) : copy.write}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
