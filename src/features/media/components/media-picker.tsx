"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { mediaAssets, type MediaAsset } from "../data/media";
import { MediaThumb } from "./media-thumb";

/** Pick one image from the library; used by the cover field and the editor's image tool. */
export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  title,
  confirmLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: MediaAsset) => void;
  title?: string;
  confirmLabel?: string;
}) {
  const { t } = useI18n();
  const copy = t.media.picker;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const images = mediaAssets.filter((asset) => asset.kind === "image" && asset.name.includes(query.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title ?? copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
          <InputGroup className="mt-2">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput placeholder={t.media.search} value={query} onChange={(event) => setQuery(event.target.value)} aria-label={copy.searchLabel} />
          </InputGroup>
        </DialogHeader>
        <DialogBody>
          <div role="listbox" aria-label={copy.images} className="grid grid-cols-2 gap-3 p-0.5 sm:grid-cols-4">
            {images.map((asset) => {
              const isSelected = selected === asset.id;
              return (
                <button
                  key={asset.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => setSelected(asset.id)}
                  onDoubleClick={() => {
                    onSelect(asset);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border text-start outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected && "ring-2 ring-ink",
                  )}
                >
                  <MediaThumb asset={asset} />
                  <span className="block truncate px-2 py-1.5 text-xs">{asset.name}</span>
                  {isSelected && (
                    <span className="absolute top-2 end-2 grid size-6 place-items-center rounded-full bg-ink text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
            {images.length === 0 && <p className="col-span-full py-10 text-center text-sm text-muted-foreground">{fill(copy.noMatch, { query })}</p>}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button
            disabled={!selected}
            onClick={() => {
              const asset = mediaAssets.find((entry) => entry.id === selected);
              if (asset) onSelect(asset);
              onOpenChange(false);
            }}
          >
            {confirmLabel ?? copy.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
