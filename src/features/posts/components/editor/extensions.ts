import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { Youtube } from "@tiptap/extension-youtube";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

/** Everything the post editor offers, configured once for every editor instance. */
export function richTextExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
    }),
    Placeholder.configure({ placeholder }),
    CharacterCount,
    // Smart quotes, dashes and arrows; fractions stay literal so "13/14"-style copy is untouched.
    Typography.configure({ oneHalf: false, oneQuarter: false, threeQuarters: false }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    TaskList,
    TaskItem.configure({ nested: true }),
    TableKit.configure({ table: { resizable: true } }),
    Image.configure({
      resize: {
        enabled: true,
        directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
        minWidth: 80,
        minHeight: 60,
        alwaysPreserveAspectRatio: true,
      },
    }),
    Youtube.configure({ nocookie: true, width: 640, height: 360 }),
  ];
}

/** Swatch names are keys into `t.editor.toolbar.colours`. */
export const TEXT_COLORS = [
  { label: "ink", value: "#161821" },
  { label: "slate", value: "#5d6273" },
  { label: "indigo", value: "#3d41d6" },
  { label: "green", value: "#12876c" },
  { label: "amber", value: "#b45309" },
  { label: "red", value: "#c8432f" },
  { label: "violet", value: "#7c3aed" },
] as const;

export const HIGHLIGHTS = [
  { label: "lime", value: "#e6f7c2" },
  { label: "yellow", value: "#fff1a8" },
  { label: "sky", value: "#dde5ff" },
  { label: "rose", value: "#fde1e1" },
  { label: "mint", value: "#d9f2e2" },
  { label: "sand", value: "#f1e9dc" },
  { label: "grey", value: "#e8ebe9" },
] as const;
