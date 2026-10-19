import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server.js";
import { proxy } from "../src/proxy";
import { canonicalPanelPath, safePanelDestination, PANEL_HOME } from "../src/config/routes";
import { localizeHref, switchLocaleHref } from "../src/i18n/config";

test("legacy workspace and auth segments move under /panel", () => {
  for (const path of ["/dashboard", "/posts/p2", "/posts/categories", "/media", "/users", "/roles", "/settings/languages", "/sign-in", "/verify-email"]) {
    assert.equal(canonicalPanelPath(path), `/panel${path}`);
  }
  for (const path of ["/", "/blog/story", "/posts-old", "/panel/posts", "/api/auth/get-session"]) assert.equal(canonicalPanelPath(path), path);
});
test("legacy redirects preserve locale, dynamic records and query parameters", () => {
  const response = proxy(new NextRequest("http://localhost:3000/de/posts/p2?tab=seo&filter=a%20b"));
  assert.equal(response?.status, 308);
  assert.equal(response?.headers.get("location"), "http://localhost:3000/de/panel/posts/p2?tab=seo&filter=a%20b");
});
test("unprefixed URLs default to English regardless of browser language", () => {
  const response = proxy(new NextRequest("http://localhost:3000/media?upload=1", { headers: { "accept-language": "ar,en;q=0.5" } }));
  assert.equal(response?.headers.get("location"), "http://localhost:3000/en/panel/media?upload=1");
});
test("public and canonical routes remain in place", () => {
  for (const path of ["/tr", "/tr/blog", "/tr/panel/posts", "/tr/panel/sign-in"]) {
    const response = proxy(new NextRequest(`http://localhost:3000${path}`));
    assert.equal(response?.headers.get("location"), null);
  }
  assert.equal(localizeHref("/panel/posts/p2?tab=seo", "tr"), "/tr/panel/posts/p2?tab=seo");
  assert.equal(switchLocaleHref("/tr/panel/settings/languages", "ar"), "/ar/panel/settings/languages");
});
test("login destinations cannot escape the workspace or loop into auth", () => {
  for (const path of [undefined, "https://example.com", "//example.com", "/panel/../blog", "/panel/%2e%2e/blog", "/panel/%2f%2fexample.com", "/panel/\\example.com", "/panel/sign-in?next=x"]) assert.equal(safePanelDestination(path), PANEL_HOME);
  assert.equal(safePanelDestination("/panel/posts/p2?tab=seo"), "/panel/posts/p2?tab=seo");
});

test("an explicit language choice is retained", () => {
  const response = proxy(new NextRequest("http://localhost:3000/", { headers: { cookie: "NEXT_LOCALE=de", "accept-language": "tr" } }));
  assert.equal(response?.headers.get("location"), "http://localhost:3000/de");
});
