/**
 * MCP tool groups, mirroring the source project's mcp/tools/*. Each group can
 * be switched off as a whole; its label is `t.mcp.groups[id]`. Content tools
 * take a `locale` argument, and `translate` adds a missing language version.
 */
export const toolGroups = [
  { id: "posts", prefix: "blog_posts_*", tools: ["list", "get", "create", "update", "translate", "publish", "delete"], writes: true },
  { id: "taxonomy", prefix: "blog_categories_*, blog_tags_*", tools: ["list", "create", "update", "delete"], writes: true },
  { id: "media", prefix: "media_*", tools: ["list", "get", "upload", "update", "delete"], writes: true },
  { id: "reviews", prefix: "reviews_*", tools: ["list", "moderate", "delete"], writes: true },
  { id: "inbox", prefix: "inbox_*", tools: ["list", "get", "mark_read", "archive"], writes: true },
  { id: "users", prefix: "users_*", tools: ["list", "get", "update_role"], writes: true },
  { id: "settings", prefix: "settings_*", tools: ["get", "update"], writes: true },
  { id: "stats", prefix: "stats_*", tools: ["overview", "daily_reads", "system", "mail"], writes: false },
  { id: "ai", prefix: "ai_*", tools: ["write_post", "rewrite_post", "translate_post", "generate_image"], writes: true },
] as const;

export const clientSnippets = (endpoint: string) => ({
  claude: JSON.stringify(
    { mcpServers: { "kitravo": { command: "pnpm", args: ["--dir", "C:/Projects/kitravo", "mcp"] } } },
    null,
    2,
  ),
  cursor: JSON.stringify(
    { mcpServers: { "kitravo": { url: endpoint, headers: { Authorization: "Bearer ${KITRAVO_MCP_TOKEN}" } } } },
    null,
    2,
  ),
  curl: `curl -X POST ${endpoint} \\
  -H "Authorization: Bearer $KITRAVO_MCP_TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`,
});
