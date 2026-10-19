import { Fragment, type ReactNode } from "react";

type RichValues = Record<string, ReactNode | ((chunks: ReactNode) => ReactNode)>;

/**
 * Renders a message that carries markup or components:
 * `rich("Delete <b>{name}</b>?", { b: (text) => <strong>{text}</strong>, name: post.title })`.
 * Tags map to functions, `{placeholders}` to nodes. Tags do not nest.
 */
export function rich(message: string, values: RichValues): ReactNode {
  const parts: ReactNode[] = [];
  const pattern = /<(\w+)>(.*?)<\/\1>|\{(\w+)\}/g;
  let last = 0;

  for (const match of message.matchAll(pattern)) {
    const [whole, tag, inner, key] = match;
    if (match.index > last) parts.push(message.slice(last, match.index));
    if (tag) {
      const render = values[tag];
      const content = rich(inner, values);
      parts.push(typeof render === "function" ? render(content) : content);
    } else {
      const value = values[key];
      parts.push(typeof value === "function" ? whole : (value ?? whole));
    }
    last = match.index + whole.length;
  }
  if (last < message.length) parts.push(message.slice(last));

  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}
