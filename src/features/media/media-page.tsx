"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "motion/react";
import { CloudUpload, FileText, Film, ImageIcon, LayoutGrid, List, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Main, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { MediaDetails } from "./components/media-details";
import { MediaThumb } from "./components/media-thumb";
import { UploadQueue, type QueuedUpload } from "./components/upload-queue";
import { mediaAssets, type MediaAsset, type MediaKind } from "./data/media";
import { ACCEPTED_TYPES, MAX_FILE_SIZE, uploadFile } from "./lib/upload";
import { useAccess, Can } from "@/components/access/access-provider";

const KIND_ICON = { image: ImageIcon, video: Film, document: FileText };

function kindOf(type: string): MediaKind {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  return "document";
}

export function MediaPage({ openUpload = false }: { openUpload?: boolean }) {
  const access = useAccess();
  const canUpload = access.can("media.upload");
  const { t, f, plural } = useI18n();
  const copy = t.media;
  const [assets, setAssets] = useState(mediaAssets);
  const [kind, setKind] = useState<"all" | MediaKind>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);
  const [queue, setQueue] = useState<QueuedUpload[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  const onDrop = useCallback((files: File[]) => {
    if (!canUpload) return;
    files.forEach((file, index) => {
      const id = `${file.name}-${file.lastModified}-${index}`;
      const controller = new AbortController();
      controllers.current.set(id, controller);
      setQueue((current) => [...current, { id, name: file.name, size: file.size, progress: 0, done: false }]);

      uploadFile(file, (progress) => setQueue((current) => current.map((item) => (item.id === id ? { ...item, progress } : item))), controller.signal)
        .then(() => {
          setQueue((current) => current.map((item) => (item.id === id ? { ...item, progress: 100, done: true } : item)));
          setAssets((current) => [
            {
              id,
              name: file.name,
              kind: kindOf(file.type),
              mimeType: file.type || "application/octet-stream",
              size: file.size,
              alt: "",
              usedIn: [],
              uploadedBy: "Musa Yazlık",
              createdAt: new Date().toISOString(),
              swatch: ["#3d41d6", "#12876c"],
            },
            ...current,
          ]);
          setTimeout(() => setQueue((current) => current.filter((item) => item.id !== id)), 2200);
        })
        .catch(() => setQueue((current) => current.filter((item) => item.id !== id)))
        .finally(() => controllers.current.delete(id));
    });
  }, [canUpload]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    disabled: !canUpload,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    noClick: true,
    noKeyboard: true,
    onDropRejected: (rejections) => toast.error(plural(copy.skipped, rejections.length), { description: copy.skippedHelp }),
  });

  // ?upload=1 (from the command menu) opens the file picker once on arrival.
  useEffect(() => {
    if (openUpload && canUpload) open();
  }, [openUpload, open, canUpload]);

  const visible = assets.filter(
    (asset) => (kind === "all" || asset.kind === kind) && asset.name.toLowerCase().includes(query.toLowerCase()),
  );
  const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);

  return (
    <div {...getRootProps({ className: "relative flex flex-1 flex-col outline-none" })}>
      <input {...getInputProps()} aria-label={copy.upload} />
      <Main>
        <PageHeader
          title={t.nav.items.media}
          description={fill(copy.description, { files: plural(copy.files, assets.length), size: f.bytes(totalSize) })}
          actions={
            <Can permission="media.upload"><Button onClick={open}>
              <Upload /> {copy.upload}
            </Button></Can>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="h-8 w-full sm:w-64">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput placeholder={copy.search} value={query} onChange={(event) => setQuery(event.target.value)} aria-label={copy.searchLabel} />
          </InputGroup>
          <ToggleGroup type="single" variant="outline" size="sm" value={kind} onValueChange={(value) => value && setKind(value as typeof kind)} aria-label={copy.fileType}>
            {(["all", "image", "video", "document"] as const).map((value) => (
              <ToggleGroupItem key={value} value={value}>
                {copy.kinds[value]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(value) => value && setView(value as typeof view)} aria-label={copy.layout} className="ms-auto">
            <ToggleGroupItem value="grid" aria-label={copy.grid}>
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label={copy.list}>
              <List />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {visible.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CloudUpload />
              </EmptyMedia>
              <EmptyTitle>{query ? fill(copy.noMatch, { query }) : copy.empty}</EmptyTitle>
              <EmptyDescription>{copy.emptyHelp}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : view === "grid" ? (
          <motion.ul layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            <AnimatePresence initial={false}>
              {visible.map((asset) => {
                const Icon = KIND_ICON[asset.kind];
                return (
                  <motion.li
                    key={asset.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
                  >
                    <button
                      type="button"
                      onClick={() => setActive(asset)}
                      className="group w-full overflow-hidden rounded-lg border bg-card text-start transition-shadow outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="overflow-hidden">
                        <MediaThumb asset={asset} className="transition-transform duration-300 group-hover:scale-[1.03]" />
                      </div>
                      <div className="grid gap-0.5 p-2.5">
                        <span className="truncate text-sm font-medium">{asset.name}</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Icon className="size-3.5" aria-hidden />
                          <span className="tabular">{f.bytes(asset.size)}</span>
                          {asset.usedIn.length > 0 && <span className="ms-auto rounded bg-ink-soft px-1.5 text-ink">{copy.inUse}</span>}
                        </span>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <ul className="divide-y rounded-lg border">
            {visible.map((asset) => (
              <li key={asset.id}>
                <button type="button" onClick={() => setActive(asset)} className="flex w-full items-center gap-3 p-2.5 text-start hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none">
                  <MediaThumb asset={asset} className="w-16 shrink-0 rounded-md" />
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">{asset.name}</span>
                    <span className="text-xs text-muted-foreground">{asset.mimeType}</span>
                  </span>
                  <span className="tabular hidden w-20 text-end text-sm text-muted-foreground sm:block">{f.bytes(asset.size)}</span>
                  <span className="tabular hidden w-28 text-end text-sm text-muted-foreground md:block">{f.date(asset.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Main>

      {/* Drop target overlay: appears only while files are dragged over the page. */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-2 z-30 grid place-items-center rounded-xl border-2 border-dashed border-ink bg-ink-soft/80 backdrop-blur-sm"
          >
            <motion.div initial={{ y: 8, scale: 0.96 }} animate={{ y: 0, scale: 1 }} className="grid justify-items-center gap-2 text-ink">
              <CloudUpload className="size-10" />
              <p className="font-heading text-xl font-semibold">{copy.drop}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UploadQueue
        items={queue}
        onCancel={(id) => {
          controllers.current.get(id)?.abort();
          toast(copy.cancelled);
        }}
      />
      <MediaDetails
        asset={active}
        onOpenChange={(isOpen) => !isOpen && setActive(null)}
        onSave={(asset) => {
          if (!canUpload) return;
          setAssets((current) => current.map((entry) => (entry.id === asset.id ? asset : entry)));
          setActive(asset);
          toast.success(copy.altSaved);
        }}
        onDelete={(asset) => { if (access.can("media.delete")) setDeleting(asset); }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
        title={fill(copy.deleteTitle, { name: deleting?.name ?? "" })}
        description={
          deleting?.usedIn.length
            ? fill(copy.deleteUsed, { places: f.list(deleting.usedIn.map((usage) => fill(copy.details.usage[usage.kind], { name: usage.name }))) })
            : copy.deleteUnused
        }
        confirmLabel={copy.deleteFile}
        onConfirm={() => {
          setAssets((current) => current.filter((asset) => asset.id !== deleting?.id));
          setActive(null);
          setDeleting(null);
          toast.success(copy.deleted);
        }}
      />
    </div>
  );
}
