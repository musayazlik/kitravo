"use client";

import { Suspense, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaPicker } from "@/features/media/components/media-picker";
import { assetUrl } from "@/features/media/data/media";
import { useI18n } from "@/i18n/provider";
import { richTextExtensions } from "./editor/extensions";
import { EditorToolbar } from "./editor/toolbar";

type RichTextEditorProps = {
  id: string;
  /** Accessible name of the writing surface. */
  label: string;
  content: string;
  onChange?: (html: string, words: number) => void;
  placeholder?: string;
  /** Language of the content being written, which can differ from the interface (an Arabic translation in an English panel). */
  lang?: string;
  dir?: "ltr" | "rtl";
};

/** Tiptap seeds each editor with `Math.random()`, so the editor streams in behind Suspense. */
export function RichTextEditor(props: RichTextEditorProps) {
  return (
    <Suspense fallback={<Skeleton className="h-[640px] rounded-sm" />}>
      <Editor {...props} />
    </Suspense>
  );
}

function Editor({ id, label, content, onChange, placeholder, lang, dir }: RichTextEditorProps) {
  const { t, plural } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const editor = useEditor({
    extensions: richTextExtensions(placeholder ?? t.editor.rich.placeholder),
    content,
    // Render on the client only; the server has no DOM to measure the editor against.
    immediatelyRender: false,
    editorProps: {
      attributes: { id, class: "prose-editor px-5 py-4 md:px-6", "aria-label": label, "aria-multiline": "true", ...(lang ? { lang } : {}), ...(dir ? { dir } : {}) },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML(), editor.storage.characterCount.words()),
  });

  const counts = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor ? { words: editor.storage.characterCount.words(), characters: editor.storage.characterCount.characters() } : null,
  });

  if (!editor) return <Skeleton className="h-[640px] rounded-sm" />;

  return (
    <div className="overflow-clip rounded-sm border bg-background focus-within:border-ring/60">
      <EditorToolbar editor={editor} onPickImage={() => setPickerOpen(true)} />
      {/* A post is a document: give it room, but cap it so long posts scroll inside the frame. */}
      <div className="max-h-[720px] min-h-[560px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <div className="tabular flex justify-end gap-4 border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <span>{plural(t.editor.rich.words, counts?.words ?? 0)}</span>
        <span>{plural(t.editor.rich.characters, counts?.characters ?? 0)}</span>
      </div>
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title={t.editor.rich.insertImage}
        confirmLabel={t.editor.rich.insertImageConfirm}
        onSelect={(asset) => editor.chain().focus().setImage({ src: assetUrl(asset), alt: asset.alt }).run()}
      />
    </div>
  );
}
