import { redirect } from "next/navigation";
import { localizeHref } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { PANEL_HOME } from "@/config/routes";

export default async function Page() {
  redirect(localizeHref(PANEL_HOME, await getLocale()));
}
