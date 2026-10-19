import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { canonicalPanelPath } from "@/config/routes";

/**
 * Every page lives under a language prefix. A URL without one (`/`,
 * `/panel/dashboard`, an old `/blog/…` link) is redirected to the visitor's
 * language when explicitly selected, otherwise English.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  const locale = isLocale(first) ? first : preferredLocale(request);
  const pagePath = isLocale(first) ? `/${pathname.split("/").slice(2).join("/")}` : pathname;
  const canonical = canonicalPanelPath(pagePath);
  if (canonical !== pagePath || !isLocale(first)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${canonical === "/" ? "" : canonical}`;
    return NextResponse.redirect(url, canonical !== pagePath ? 308 : 307);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kitravo-return-to", `${pagePath}${request.nextUrl.search}`);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  return defaultLocale;
}

export const config = {
  // Pages only: skip Next internals, API routes, public images and any file with an extension.
  matcher: ["/((?!_next|api|images|.*\\..*).*)"],
};
