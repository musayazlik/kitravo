"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, KeyRound, Languages, RefreshCw, Send, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CopyButton } from "@/components/copy-button";
import { Main, PageHeader } from "@/components/layout/page-header";
import { AnimatedTabsList } from "@/components/motion/animated-tabs";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAccess } from "@/components/access/access-provider";
import { ActionButton } from "@/components/access/action-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { siteConfig } from "@/config/site";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { clientSnippets, toolGroups } from "./data/tools";

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return `nok_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function McpPage() {
  const access = useAccess();
  const { t, f, plural } = useI18n();
  const copy = t.mcp;
  const endpoint = `${siteConfig.url}/api/mcp`;
  const [httpEnabled, setHttpEnabled] = useState(true);
  const [hasToken, setHasToken] = useState(true);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [enabledGroups, setEnabledGroups] = useState<Set<string>>(() => new Set(toolGroups.map((group) => group.id)));
  const [client, setClient] = useState("claude");
  const snippets = clientSnippets(endpoint);

  // Generated in the click handler: the token exists only in this response and is never stored in plain text.
  const generate = () => {
    setRevealed(randomToken());
    setHasToken(true);
    setConfirmRotate(false);
  };

  const toolCount = toolGroups.filter((group) => enabledGroups.has(group.id)).reduce((sum, group) => sum + group.tools.length, 0);

  return (
    <Main>
      <PageHeader
        title={t.nav.items.mcp}
        description={copy.description}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                {copy.http}
                <StatusBadge tone={httpEnabled && hasToken ? "signal" : "muted"}>{httpEnabled && hasToken ? copy.accepting : copy.off}</StatusBadge>
              </CardTitle>
              <CardDescription>{copy.httpHelp}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field orientation="horizontal" className="rounded-lg border p-3">
                <div className="grid flex-1 gap-1">
                  <FieldLabel htmlFor="http">{copy.acceptHttp}</FieldLabel>
                  <FieldDescription>{fill(copy.acceptHttpHelp, { host: endpoint.replace(/^https?:\/\//, "") })}</FieldDescription>
                </div>
                <Switch disabled={!access.can("mcp.manage")} id="http" checked={httpEnabled} onCheckedChange={setHttpEnabled} />
              </Field>
              <Field>
                <FieldLabel htmlFor="endpoint">{copy.endpoint}</FieldLabel>
                <div className="flex gap-2">
                  <Input id="endpoint" readOnly dir="ltr" value={endpoint} className="font-mono text-sm" />
                  <CopyButton value={endpoint} label={copy.copyEndpoint} className="size-8 border" />
                </div>
              </Field>

              <AnimatePresence initial={false} mode="wait">
                {revealed ? (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Alert className="border-proof/50 bg-proof-soft">
                      <ShieldAlert />
                      <AlertTitle>{copy.copyNow}</AlertTitle>
                      <AlertDescription className="grid gap-3">
                        <span>{copy.shownOnce}</span>
                        <span className="flex items-center gap-2 rounded-md border bg-background p-2" dir="ltr">
                          <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{revealed}</code>
                          <CopyButton value={revealed} label={copy.copyToken} />
                        </span>
                        <ActionButton permission="mcp.manage" variant="outline" size="sm" className="w-fit" onClick={() => setRevealed(null)}>
                          {copy.savedIt}
                        </ActionButton>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                ) : (
                  <motion.div key="token" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                    <KeyRound className="size-4 text-muted-foreground" aria-hidden />
                    <span className="grid flex-1">
                      <span className="text-sm font-medium">{hasToken ? copy.tokenSet : copy.noToken}</span>
                      <span className="text-xs text-muted-foreground">{hasToken ? fill(copy.tokenMeta, { date: f.date("2026-10-03") }) : copy.tokenHelp}</span>
                    </span>
                    <ActionButton permission="mcp.manage" variant={hasToken ? "outline" : "default"} size="sm" onClick={() => (hasToken ? setConfirmRotate(true) : generate())}>
                      <RefreshCw /> {hasToken ? copy.regenerate : copy.generate}
                    </ActionButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">{copy.tools}</CardTitle>
              <CardDescription>{plural(copy.toolsHelp, toolCount)}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="flex items-start gap-2 rounded-lg bg-ink-soft/60 px-3 py-2 text-xs text-ink">
                <Languages className="mt-0.5 size-3.5 shrink-0" /> {copy.languageNote}
              </p>
              <ul className="divide-y rounded-lg border">
                {toolGroups.map((group) => (
                  <Collapsible key={group.id} asChild>
                    <li className="group/tool">
                      <div className="flex items-center gap-3 p-3">
                        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 rounded text-start outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool:rotate-90 rtl:group-data-[state=open]/tool:-rotate-90" />
                          <span className="grid min-w-0">
                            <span className="text-sm font-medium">{copy.groups[group.id]}</span>
                            <code className="truncate font-mono text-xs text-muted-foreground" dir="ltr">
                              {group.prefix}
                            </code>
                          </span>
                        </CollapsibleTrigger>
                        {!group.writes && <StatusBadge tone="muted">{copy.readOnly}</StatusBadge>}
                        <Switch disabled={!access.can("mcp.manage")}
                          aria-label={fill(copy.enable, { name: copy.groups[group.id] })}
                          checked={enabledGroups.has(group.id)}
                          onCheckedChange={(on) =>
                            setEnabledGroups((current) => {
                              const next = new Set(current);
                              if (on) next.add(group.id);
                              else next.delete(group.id);
                              return next;
                            })
                          }
                        />
                      </div>
                      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                        <div className="flex flex-wrap gap-1.5 px-3 pb-3 ps-9" dir="ltr">
                          {group.tools.map((tool) => (
                            <code key={tool} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                              {group.prefix.split("*")[0]}
                              {tool}
                            </code>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </li>
                  </Collapsible>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">{copy.connect}</CardTitle>
              <CardDescription>{copy.connectHelp}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={client} onValueChange={setClient} className="gap-3">
                <AnimatedTabsList
                  value={client}
                  className="w-full sm:w-fit"
                  tabs={[
                    { value: "claude", label: "Claude Desktop" },
                    { value: "cursor", label: "Cursor (HTTP)" },
                    { value: "curl", label: "curl" },
                  ]}
                />
                {(["claude", "cursor", "curl"] as const).map((key) => (
                  <TabsContent key={key} value={key}>
                    <div className="relative" dir="ltr">
                      <pre className="overflow-x-auto rounded-lg bg-[#161821] p-4 pe-12 font-mono text-xs leading-6 text-[#e3e5f0]">{snippets[key]}</pre>
                      <CopyButton value={snippets[key]} className="absolute top-2 end-2 text-[#e3e5f0] hover:bg-white/10 hover:text-white" />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">{copy.runAs}</CardTitle>
              <CardDescription>{copy.runAsHelp}</CardDescription>
            </CardHeader>
            <CardContent>
              <Select defaultValue="u1">
                <SelectTrigger disabled={!access.can("mcp.manage")} className="w-full" aria-label={copy.adminAccount}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="u1">Musa Yazlık ({t.users.roles.superadmin})</SelectItem>
                  <SelectItem value="u3">Jonas Weber ({t.users.roles.admin})</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">{copy.models}</CardTitle>
              <CardDescription>{copy.modelsHelp}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-4">
                {[
                  { id: "text", label: copy.modelLabels.text, value: "anthropic/claude-sonnet-5.5", options: ["anthropic/claude-sonnet-5.5", "anthropic/claude-opus-5.5", "google/gemini-3-pro"] },
                  { id: "image", label: copy.modelLabels.image, value: "google/gemini-3-pro-image", options: ["google/gemini-3-pro-image", "openai/gpt-image-2"] },
                  { id: "research", label: copy.modelLabels.research, value: "perplexity/sonar-pro", options: ["perplexity/sonar-pro", "perplexity/sonar-deep-research"] },
                ].map((model) => (
                  <Field key={model.id}>
                    <FieldLabel htmlFor={`model-${model.id}`}>{model.label}</FieldLabel>
                    <Select defaultValue={model.value}>
                      <SelectTrigger disabled={!access.can("mcp.manage")} id={`model-${model.id}`} className="w-full font-mono text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {model.options.map((option) => (
                          <SelectItem key={option} value={option} className="font-mono text-xs">
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                ))}
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end">
              <ActionButton permission="mcp.manage" onClick={() => toast.success(copy.modelsSaved)}>{copy.saveModels}</ActionButton>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                {copy.telegram} <StatusBadge tone="signal">{copy.connected}</StatusBadge>
              </CardTitle>
              <CardDescription>{copy.telegramHelp}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p className="flex justify-between">
                <span className="text-muted-foreground">{copy.linked}</span>
                <span className="tabular">{f.number(2)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">{copy.delivery}</span>
                <span>{copy.webhook}</span>
              </p>
            </CardContent>
            <CardFooter>
              <ActionButton permission="mcp.manage" variant="outline" className="w-full" onClick={() => toast.success(copy.linkOpened)}>
                <Send /> {copy.link}
              </ActionButton>
            </CardFooter>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRotate}
        onOpenChange={setConfirmRotate}
        title={copy.rotateTitle}
        description={copy.rotateBody}
        confirmLabel={copy.rotateConfirm}
        onConfirm={generate}
      />
    </Main>
  );
}
