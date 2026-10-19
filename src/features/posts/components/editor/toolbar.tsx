"use client";

import { useState, type ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Code,
  Highlighter,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  Underline,
  Undo2,
  SquarePlay,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Dictionary } from "@/i18n/dictionary";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { HIGHLIGHTS, TEXT_COLORS } from "./extensions";

type Labels = Dictionary["editor"]["toolbar"];
/** `label` is a key into the toolbar messages. */
type Mark = { label: Exclude<keyof Labels, "colours">; icon: LucideIcon; isActive: (e: Editor) => boolean; run: (e: Editor) => void };

const FORMAT: Mark[] = [
  { label: "bold", icon: Bold, isActive: (e) => e.isActive("bold"), run: (e) => e.chain().focus().toggleBold().run() },
  { label: "italic", icon: Italic, isActive: (e) => e.isActive("italic"), run: (e) => e.chain().focus().toggleItalic().run() },
  { label: "underline", icon: Underline, isActive: (e) => e.isActive("underline"), run: (e) => e.chain().focus().toggleUnderline().run() },
  { label: "strike", icon: Strikethrough, isActive: (e) => e.isActive("strike"), run: (e) => e.chain().focus().toggleStrike().run() },
  { label: "code", icon: Code, isActive: (e) => e.isActive("code"), run: (e) => e.chain().focus().toggleCode().run() },
  { label: "subscript", icon: Subscript, isActive: (e) => e.isActive("subscript"), run: (e) => e.chain().focus().toggleSubscript().run() },
  { label: "superscript", icon: Superscript, isActive: (e) => e.isActive("superscript"), run: (e) => e.chain().focus().toggleSuperscript().run() },
];

const ALIGN: Mark[] = (
  [
    ["left", "alignLeft", AlignLeft],
    ["center", "alignCenter", AlignCenter],
    ["right", "alignRight", AlignRight],
    ["justify", "justify", AlignJustify],
  ] as const
).map(([value, label, icon]) => ({
  label,
  icon,
  isActive: (e) => e.isActive({ textAlign: value }),
  run: (e) => e.chain().focus().setTextAlign(value).run(),
}));

const LISTS: Mark[] = [
  { label: "bulletList", icon: List, isActive: (e) => e.isActive("bulletList"), run: (e) => e.chain().focus().toggleBulletList().run() },
  { label: "numberedList", icon: ListOrdered, isActive: (e) => e.isActive("orderedList"), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { label: "checklist", icon: ListChecks, isActive: (e) => e.isActive("taskList"), run: (e) => e.chain().focus().toggleTaskList().run() },
];

const BLOCKS: Mark[] = [
  { label: "quote", icon: Quote, isActive: (e) => e.isActive("blockquote"), run: (e) => e.chain().focus().toggleBlockquote().run() },
  { label: "codeBlock", icon: SquareCode, isActive: (e) => e.isActive("codeBlock"), run: (e) => e.chain().focus().toggleCodeBlock().run() },
];

const ALL = [...FORMAT, ...ALIGN, ...LISTS, ...BLOCKS];

function listItemType(e: Editor) {
  return e.isActive("taskItem") ? "taskItem" : "listItem";
}

function blockType(e: Editor) {
  for (const level of [2, 3, 4] as const) if (e.isActive("heading", { level })) return `h${level}`;
  return "p";
}

/** Icon button with a tooltip that doubles as its accessible name. */
function Tool({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Group({ children }: { children: ReactNode }) {
  return (
    <>
      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />
      <div className="flex items-center gap-0.5">{children}</div>
    </>
  );
}

function Marks({ editor, marks, active }: { editor: Editor; marks: Mark[]; active: boolean[] }) {
  const { t } = useI18n();
  return marks.map((mark) => (
    <Tool key={mark.label} label={t.editor.toolbar[mark.label]}>
      <Toggle size="sm" aria-label={t.editor.toolbar[mark.label]} pressed={active[ALL.indexOf(mark)]} onPressedChange={() => mark.run(editor)}>
        <mark.icon />
      </Toggle>
    </Tool>
  ));
}

function Swatches({
  label,
  icon: Icon,
  swatches,
  current,
  onPick,
  onClear,
}: {
  label: string;
  icon: LucideIcon;
  swatches: readonly { label: keyof Labels["colours"]; value: string }[];
  current?: string;
  onPick: (value: string) => void;
  onClear: () => void;
}) {
  const { t } = useI18n();

  return (
    <Popover>
      <Tool label={label}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={label} className="relative">
            <Icon />
            <span aria-hidden className="absolute inset-x-1.5 bottom-1 h-0.5 rounded-sm" style={{ background: current ?? "transparent" }} />
          </Button>
        </PopoverTrigger>
      </Tool>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-7 gap-1.5" role="group" aria-label={label}>
          {swatches.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              aria-label={t.editor.toolbar.colours[swatch.label]}
              title={t.editor.toolbar.colours[swatch.label]}
              onClick={() => onPick(swatch.value)}
              className={cn(
                "size-6 rounded-sm border outline-none focus-visible:ring-2 focus-visible:ring-ring",
                current === swatch.value && "ring-2 ring-ink ring-offset-1 ring-offset-popover",
              )}
              style={{ background: swatch.value }}
            />
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={onClear}>
          {t.editor.toolbar.none}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

/** Small popover with a URL field, used for links and YouTube embeds. */
function UrlTool({
  label,
  icon: Icon,
  pressed,
  initial = "",
  placeholder,
  submitLabel,
  onSubmit,
  onRemove,
}: {
  label: string;
  icon: LucideIcon;
  pressed?: boolean;
  initial?: string;
  placeholder: string;
  submitLabel: string;
  onSubmit: (url: string) => void;
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(initial);
  const { t } = useI18n();

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setUrl(initial);
      }}
    >
      <Tool label={label}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={label} data-state={pressed ? "on" : "off"} className="data-[state=on]:bg-muted">
            <Icon />
          </Button>
        </PopoverTrigger>
      </Tool>
      <PopoverContent className="w-80 p-2" align="start">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (url.trim()) onSubmit(url.trim());
            setOpen(false);
          }}
        >
          <Input autoFocus type="url" dir="ltr" value={url} onChange={(event) => setUrl(event.target.value)} placeholder={placeholder} aria-label={label} />
          <Button type="submit" size="sm" className="h-8">
            {submitLabel}
          </Button>
        </form>
        {onRemove && pressed && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-destructive hover:text-destructive"
            onClick={() => {
              onRemove();
              setOpen(false);
            }}
          >
            {t.editor.toolbar.removeLink}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function EditorToolbar({ editor, onPickImage }: { editor: Editor; onPickImage: () => void }) {
  const { t } = useI18n();
  const l = t.editor.toolbar;
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      active: ALL.map((mark) => mark.isActive(e)),
      block: blockType(e),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      canSink: e.can().sinkListItem(listItemType(e)),
      canLift: e.can().liftListItem(listItemType(e)),
      color: e.getAttributes("textStyle").color as string | undefined,
      highlight: e.isActive("highlight") ? ((e.getAttributes("highlight").color as string | undefined) ?? "#fff1a8") : undefined,
      link: e.isActive("link") ? (e.getAttributes("link").href as string) : undefined,
      inTable: e.isActive("table"),
    }),
  });

  return (
    <div
      role="toolbar"
      aria-label={l.formatting}
      className="sticky top-14 z-10 flex flex-wrap items-center gap-y-1 border-b bg-background/95 p-1.5 backdrop-blur-md"
    >
      <div className="flex items-center gap-0.5">
        <Tool label={l.undo}>
          <Button variant="ghost" size="icon-sm" aria-label={l.undo} disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 />
          </Button>
        </Tool>
        <Tool label={l.redo}>
          <Button variant="ghost" size="icon-sm" aria-label={l.redo} disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 />
          </Button>
        </Tool>
      </div>

      <Group>
        <Select
          value={state.block}
          onValueChange={(value) => {
            const chain = editor.chain().focus();
            if (value === "p") chain.setParagraph().run();
            else chain.toggleHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run();
          }}
        >
          <SelectTrigger size="sm" className="w-32 border-none shadow-none" aria-label={l.textStyle}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">{l.paragraph}</SelectItem>
            {[2, 3, 4].map((level) => (
              <SelectItem key={level} value={`h${level}`}>
                {fill(l.heading, { level })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Group>

      <Group>
        <Marks editor={editor} marks={FORMAT} active={state.active} />
      </Group>

      <Group>
        <Swatches
          label={l.textColour}
          icon={Baseline}
          swatches={TEXT_COLORS}
          current={state.color}
          onPick={(value) => editor.chain().focus().setColor(value).run()}
          onClear={() => editor.chain().focus().unsetColor().run()}
        />
        <Swatches
          label={l.highlight}
          icon={Highlighter}
          swatches={HIGHLIGHTS}
          current={state.highlight}
          onPick={(value) => editor.chain().focus().setHighlight({ color: value }).run()}
          onClear={() => editor.chain().focus().unsetHighlight().run()}
        />
        <UrlTool
          label={l.link}
          icon={Link2}
          pressed={Boolean(state.link)}
          initial={state.link}
          placeholder="https://example.com"
          submitLabel={l.apply}
          onSubmit={(href) => editor.chain().focus().extendMarkRange("link").setLink({ href }).run()}
          onRemove={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
        />
        <Tool label={l.clear}>
          <Button variant="ghost" size="icon-sm" aria-label={l.clear} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
            <RemoveFormatting />
          </Button>
        </Tool>
      </Group>

      <Group>
        <Marks editor={editor} marks={ALIGN} active={state.active} />
      </Group>

      <Group>
        <Marks editor={editor} marks={LISTS} active={state.active} />
        <Tool label={l.outdent}>
          <Button variant="ghost" size="icon-sm" aria-label={l.outdentShort} disabled={!state.canLift} onClick={() => editor.chain().focus().liftListItem(listItemType(editor)).run()}>
            <IndentDecrease />
          </Button>
        </Tool>
        <Tool label={l.indent}>
          <Button variant="ghost" size="icon-sm" aria-label={l.indentShort} disabled={!state.canSink} onClick={() => editor.chain().focus().sinkListItem(listItemType(editor)).run()}>
            <IndentIncrease />
          </Button>
        </Tool>
      </Group>

      <Group>
        <Marks editor={editor} marks={BLOCKS} active={state.active} />
        <Tool label={l.divider}>
          <Button variant="ghost" size="icon-sm" aria-label={l.divider} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus />
          </Button>
        </Tool>
      </Group>

      <Group>
        <DropdownMenu>
          <Tool label={l.table}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={l.table} data-state={state.inTable ? "on" : "off"} className="data-[state=on]:bg-muted">
                <Table />
              </Button>
            </DropdownMenuTrigger>
          </Tool>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onSelect={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              {l.insertTable}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!state.inTable} onSelect={() => editor.chain().focus().addRowAfter().run()}>
              {l.addRow}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!state.inTable} onSelect={() => editor.chain().focus().addColumnAfter().run()}>
              {l.addColumn}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!state.inTable} onSelect={() => editor.chain().focus().deleteRow().run()}>
              {l.deleteRow}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!state.inTable} onSelect={() => editor.chain().focus().deleteColumn().run()}>
              {l.deleteColumn}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={!state.inTable} onSelect={() => editor.chain().focus().deleteTable().run()}>
              {l.deleteTable}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tool label={l.image}>
          <Button variant="ghost" size="icon-sm" aria-label={l.insertImage} onClick={onPickImage}>
            <ImagePlus />
          </Button>
        </Tool>
        <UrlTool
          label={l.youtube}
          icon={SquarePlay}
          placeholder="https://youtube.com/watch?v=…"
          submitLabel={l.embed}
          onSubmit={(src) => editor.chain().focus().setYoutubeVideo({ src }).run()}
        />
      </Group>
    </div>
  );
}
