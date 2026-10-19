"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { Copy, Link2, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ActionButton } from "@/components/access/action-button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import type { MediaAsset } from "../data/media";
import { MediaThumb } from "./media-thumb";

export function MediaDetails({
  asset,
  onOpenChange,
  onSave,
  onDelete,
}: {
  asset: MediaAsset | null;
  onOpenChange: (open: boolean) => void;
  onSave: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
}) {
  return (
    <Sheet open={asset !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {asset && <Details key={asset.id} asset={asset} onSave={onSave} onDelete={onDelete} />}
      </SheetContent>
    </Sheet>
  );
}

function Details({ asset, onSave, onDelete }: { asset: MediaAsset; onSave: (asset: MediaAsset) => void; onDelete: (asset: MediaAsset) => void }) {
  const { t, f, plural } = useI18n();
  const copy = t.media.details;
  const [alt, setAlt] = useState(asset.alt);
  const url = `https://utfs.io/f/${asset.id}-${asset.name}`;
  const facts: [string, string][] = [
    [copy.type, asset.mimeType],
    [copy.size, f.bytes(asset.size)],
    ...(asset.width ? ([[copy.dimensions, `${asset.width} × ${asset.height}`]] as [string, string][]) : []),
    [copy.uploaded, f.dateTime(asset.createdAt)],
    [copy.by, asset.uploadedBy],
  ];

  return (
    <>
      <SheetHeader>
        <SheetTitle className="truncate pe-6">{asset.name}</SheetTitle>
        <SheetDescription>{copy.description}</SheetDescription>
      </SheetHeader>
      <div className="grid gap-5 overflow-y-auto px-4 pb-4">
        <MediaThumb asset={asset} className="rounded-lg border" />
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="tabular truncate">{value}</dd>
            </div>
          ))}
        </dl>
        {asset.kind === "image" && (
          <Field>
            <FieldLabel htmlFor="alt">{copy.alt}</FieldLabel>
            <Input id="alt" value={alt} onChange={(event) => setAlt(event.target.value)} />
            <FieldDescription>{copy.altHelp}</FieldDescription>
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="url">{copy.url}</FieldLabel>
          <div className="flex gap-2">
            <Input id="url" readOnly dir="ltr" value={url} className="font-mono text-xs" />
            <ActionButton permission="media.upload"
              variant="outline"
              size="icon"
              aria-label={copy.copyUrl}
              onClick={() => navigator.clipboard.writeText(url).then(() => toast.success(copy.urlCopied))}
            >
              <Copy />
            </ActionButton>
          </div>
        </Field>
        <section className="grid gap-2">
          <h3 className="font-sans text-sm font-medium">{copy.usedIn}</h3>
          {asset.usedIn.length ? (
            <ul className="grid gap-1">
              {asset.usedIn.map((usage) => (
                <li key={usage.href + usage.name}>
                  <Link href={usage.href} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                    <Link2 className="size-4 text-muted-foreground" /> {fill(copy.usage[usage.kind], { name: usage.name })}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{copy.unused}</p>
          )}
        </section>
        {asset.usedIn.length > 0 && (
          <Alert>
            <TriangleAlert />
            <AlertTitle>{plural(copy.breaks, asset.usedIn.length)}</AlertTitle>
            <AlertDescription>{copy.breaksHelp}</AlertDescription>
          </Alert>
        )}
      </div>
      <SheetFooter className="flex-row border-t">
        <ActionButton permission="media.delete" variant="destructive" onClick={() => onDelete(asset)}>
          <Trash2 /> {t.common.delete}
        </ActionButton>
        <ActionButton permission="media.upload" className="ms-auto" onClick={() => onSave({ ...asset, alt })} disabled={alt === asset.alt}>
          {copy.saveAlt}
        </ActionButton>
      </SheetFooter>
    </>
  );
}
