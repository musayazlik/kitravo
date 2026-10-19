import type { Locale } from "./config";

/**
 * A message that changes with a count. `other` is required; the remaining
 * forms follow CLDR plural categories, so Arabic can fill `zero`, `two`,
 * `few` and `many` while Chinese only needs `other`. `{count}` is filled in.
 */
export type Plural = {
  other: string;
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
};

/** Marks a message as plural so every language may choose its own forms. */
export const p = (forms: Plural): Plural => forms;

/**
 * One namespace of messages in every language. English is the source: it
 * fixes the shape, and a missing or extra key in any other language is a
 * type error.
 */
export function defineMessages<T>(messages: { en: T } & Record<Exclude<Locale, "en">, NoInfer<T>>): Record<Locale, T> {
  return messages;
}
