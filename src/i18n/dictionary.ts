import type { Locale } from "./config";
import studio from "./messages/studio";
import access from "./messages/access";
import auth from "./messages/auth";
import blog from "./messages/blog";
import comments from "./messages/comments";
import common from "./messages/common";
import dashboard from "./messages/dashboard";
import editor from "./messages/editor";
import inbox from "./messages/inbox";
import mail from "./messages/mail";
import mcp from "./messages/mcp";
import media from "./messages/media";
import nav from "./messages/nav";
import posts from "./messages/posts";
import reviews from "./messages/reviews";
import seo from "./messages/seo";
import settings from "./messages/settings";
import site from "./messages/site";
import users from "./messages/users";

/**
 * Every namespace, in every language. Server code picks one language with
 * `dictionaryFor()`; the root layout hands that slice to client components
 * through `I18nProvider`, so the browser only receives the active language.
 */
const namespaces = {
  studio,
  access,
  auth,
  common,
  nav,
  site,
  blog,
  posts,
  editor,
  comments,
  dashboard,
  media,
  inbox,
  reviews,
  users,
  seo,
  mail,
  mcp,
  settings,
};

export type Dictionary = { [K in keyof typeof namespaces]: (typeof namespaces)[K]["en"] };

const cache = new Map<Locale, Dictionary>();

export function dictionaryFor(locale: Locale): Dictionary {
  let dictionary = cache.get(locale);
  if (!dictionary) {
    dictionary = Object.fromEntries(Object.entries(namespaces).map(([name, messages]) => [name, messages[locale]])) as Dictionary;
    cache.set(locale, dictionary);
  }
  return dictionary;
}
