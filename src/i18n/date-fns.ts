import { ar, de, enGB, tr, zhCN, type Locale as DateFnsLocale } from "date-fns/locale";
import type { Locale } from "./config";

/** date-fns locale per language, for components that format through date-fns (the calendar). */
export const dateFnsLocales: Record<Locale, DateFnsLocale> = { en: enGB, tr, de, ar, zh: zhCN };
