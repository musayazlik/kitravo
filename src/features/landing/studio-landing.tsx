"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, Bold, Check, CheckCheck, ChevronRight, Code2, Copy, FileText, Globe2, ImageIcon, Italic, LayoutGrid, Link2, List, MoreHorizontal, Plus, ShieldCheck, Sparkles, Type, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/layout/logo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { siteConfig } from "@/config/site";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { DemoEntry } from "./components/demo-entry";

type Scene = "write" | "media" | "publish";
const sceneIcons = { write: FileText, media: ImageIcon, publish: CheckCheck };
const featureIcons = [Type, ImageIcon, ShieldCheck];
const featureHrefs = ["/panel/posts", "/panel/media", "/panel/sign-in?next=%2Fpanel%2Froles"];
const commands = "pnpm install\ncp .env.example .env.local\npnpm dev";

/** Keep the first client render consistent with SSR; CSS supplies the static reduced-motion state. */
function useLandingReducedMotion() {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  return hydrated && reduced === true;
}

export function StudioLanding({ demoEnabled }: { demoEnabled: boolean }) {
  const { t } = useI18n();
  const copy = t.studio;
  const faq = t.site.faq;
  const questions = [{ question: faq.github.question, answer: siteConfig.githubUrl ? faq.github.released : faq.github.preparing }, ...faq.items];
  const reduced = useLandingReducedMotion();
  const [copied, setCopied] = useState(false);

  return <div className="studio-page">
    <section className="studio-hero" aria-labelledby="studio-title">
      <Container className="px-5 sm:px-8">
        <div className="studio-hero-heading">
          <div>
            <p className="studio-intro"><span aria-hidden />{copy.intro}</p>
            <motion.h1 id="studio-title" initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: [.22, 1, .36, 1] }}>
              {copy.title1}<br />{copy.title2}
            </motion.h1>
          </div>
          <div className="studio-hero-copy">
            <p>{copy.lead}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <DemoEntry enabled={demoEnabled} className="studio-primary">{demoEnabled ? copy.demo : t.site.nav.openPanel}</DemoEntry>
              <a href={siteConfig.githubUrl ?? "#open-source"} className="studio-source-link" target={siteConfig.githubUrl ? "_blank" : undefined} rel={siteConfig.githubUrl ? "noreferrer" : undefined}>{copy.source}<Code2 className="size-4" aria-hidden /></a>
            </div>
            <p className="studio-hero-note">{copy.note}</p>
          </div>
        </div>
        <ProductStage />
        <div id="stack" className="studio-stack"><p>{copy.builtWith}</p><div>{["Next.js", "React", "Tailwind CSS", "Tiptap", "Better Auth"].map((tool) => <span key={tool}>{tool}</span>)}</div></div>
      </Container>
    </section>

    <section id="modules" className="studio-features" aria-labelledby="studio-flow-title">
      <Container className="px-5 sm:px-8">
        <div className="studio-section-heading"><h2 id="studio-flow-title">{copy.flowTitle}</h2><p>{copy.flowLead}</p></div>
        <FeatureExplorer />
      </Container>
    </section>

    <section id="agents" className="studio-connection" aria-labelledby="connection-title">
      <Container className="grid items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <div className="studio-connection-copy"><span className="studio-connection-symbol" aria-hidden><Sparkles /></span><h2 id="connection-title">{t.site.agents.title1}<br />{t.site.agents.title2}</h2><p>{t.site.agents.lead}</p><Link className="studio-text-link" href="/panel/mcp">{t.site.links.agents}<ArrowUpRight className="size-4" aria-hidden /></Link></div>
        <AgentConnection />
      </Container>
    </section>

    <section id="open-source" className="studio-open" aria-labelledby="studio-open-title">
      <Container className="grid items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:py-24">
        <div><Code2 className="mb-7 size-8" aria-hidden /><h2 id="studio-open-title">{copy.openTitle}</h2><p className="studio-open-lead">{copy.openLead}</p><p className="studio-open-note">{copy.openNote}</p>{siteConfig.githubUrl ? <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer" className="studio-open-link">{t.site.hero.github}<ArrowUpRight className="size-4" aria-hidden /></a> : <p className="studio-open-link">{t.site.footer.comingToGitHub}</p>}</div>
        <div id="start" className="studio-terminal" dir="ltr"><div className="studio-terminal-top"><span><span aria-hidden />{copy.terminal}</span><button aria-label={copy.copy} className="studio-copy" onClick={async () => { try { await navigator.clipboard.writeText(commands); setCopied(true); } catch { toast.error(copy.copyError); } }}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}<span>{copied ? copy.copied : copy.copy}</span></button></div><pre><code>{commands.split("\n").map((command, index) => <span key={command} className="studio-command"><span aria-hidden className="studio-terminal-prompt">$</span>{command}{index === 2 && <span className="studio-terminal-cursor" aria-hidden />}</span>)}</code></pre><div className="studio-terminal-bottom"><span className="studio-terminal-status" aria-hidden />{siteConfig.name} <ChevronRight className="size-3" aria-hidden />localhost:3000</div></div>
      </Container>
    </section>

    <section className="studio-faq" aria-labelledby="studio-faq-title"><Container className="grid gap-9 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-24"><div><h2 id="studio-faq-title">{faq.title1}<br />{faq.title2}</h2><Link href="/blog" className="studio-text-link">{faq.notes}<ArrowUpRight className="size-4" aria-hidden /></Link></div><Accordion type="single" collapsible>{questions.map((question, index) => <AccordionItem key={question.question} value={`faq-${index}`}><AccordionTrigger className="py-6 text-start text-base font-medium hover:no-underline">{question.question}</AccordionTrigger><AccordionContent className="pb-6 text-sm leading-7 text-muted-foreground">{question.answer}</AccordionContent></AccordionItem>)}</Accordion></Container></section>

    <section className="studio-final" aria-labelledby="studio-final-title"><Container className="px-5 sm:px-8"><div className="studio-final-line"><h2 id="studio-final-title">{copy.finalTitle}</h2><DemoEntry enabled={demoEnabled} className="studio-primary">{copy.finalLink}</DemoEntry></div></Container></section>
  </div>;
}

function ProductStage() {
  const { t } = useI18n();
  const copy = t.studio;
  const [scene, setScene] = useState<Scene>("write");
  const target = useRef<HTMLDivElement>(null);
  const reduced = useLandingReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const floatY = useTransform(scrollYProgress, [0, 1], [42, -74]);
  const rotate = useSpring(0, { stiffness: 110, damping: 24 });
  return <div ref={target} className="studio-product-stage">
    <div className="studio-scene-picker" role="group" aria-label={copy.preview}>{(["write", "media", "publish"] as const).map((key, index) => { const Icon = sceneIcons[key]; return <button key={key} aria-pressed={scene === key} onClick={() => setScene(key)}><span className="studio-step-number" aria-hidden>{index + 1}</span><Icon className="size-4" aria-hidden /><span>{copy[key]}</span>{scene === key && <motion.span layoutId="scene-line" className="studio-scene-line" transition={{ type: "spring", stiffness: 350, damping: 32 }} />}</button>; })}</div>
    <motion.div initial={reduced ? false : { opacity: 0, y: 64, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, delay: .15, ease: [.22, 1, .36, 1] }} className="studio-stage-intro">
      <motion.div className="studio-browser" style={{ y: reduced ? 0 : y, rotateY: reduced ? 0 : rotate }} onPointerMove={(event) => { if (event.pointerType !== "mouse" || reduced) return; const box = event.currentTarget.getBoundingClientRect(); rotate.set(((event.clientX - box.left) / box.width - .5) * 3); }} onPointerLeave={() => rotate.set(0)}>
        <div className="studio-browser-top"><LogoMark className="size-5" /><span>{siteConfig.name}</span><span className="studio-browser-location">{copy.workspace}<ChevronRight className="size-3" />{copy[scene]}</span><span className="studio-preview-label">{copy.example}</span><MoreHorizontal className="size-4" aria-hidden /></div>
        <div className="studio-workspace"><aside className="studio-preview-sidebar" aria-hidden><span className="studio-sidebar-square"><LayoutGrid /></span><span className={cn(scene === "write" && "is-active")}><FileText /></span><span className={cn(scene === "media" && "is-active")}><ImageIcon /></span><span className={cn(scene === "publish" && "is-active")}><Globe2 /></span><span className="studio-sidebar-bottom"><Plus /></span></aside><div className="studio-preview-viewport"><AnimatePresence mode="wait" initial={false}><motion.div key={scene} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -10 }} transition={{ duration: .22 }} className="studio-preview-scene">{scene === "write" ? <EditorPreview /> : scene === "media" ? <MediaPreview /> : <PublishPreview />}</motion.div></AnimatePresence></div></div>
        <div className="studio-browser-bottom"><span><span className="studio-save-dot" aria-hidden />{copy.saved}</span><span>{copy.words}</span><span>Tiptap</span></div>
      </motion.div>
      <motion.div className="studio-floating-note" style={{ y: reduced ? 0 : floatY, rotate: reduced ? 0 : -5 }} aria-hidden><span className="studio-note-icon"><CheckCheck /></span><div><span>{copy.saved}</span><p>{copy.articleSecond}</p></div></motion.div>
      <motion.div className="studio-floating-cover" style={{ y: reduced ? 0 : floatY, rotate: reduced ? 0 : 7 }} aria-hidden><CoverArt variant={1} /><span>{copy.cover}</span></motion.div>
    </motion.div>
    <a href="#modules" className="studio-explore-down" aria-label={t.site.hero.discoverStack}><ArrowDown className="size-4" /></a>
  </div>;
}

function EditorPreview() {
  const { t } = useI18n();
  const copy = t.studio;
  return <div className="studio-editor-preview"><div className="studio-editor-top"><span><FileText className="size-4" />{copy.draft}</span><span><span className="studio-draft-dot" />{t.posts.status.draft}</span></div><div className="studio-editor-tools" aria-hidden><Undo2 /><span /> <Type /><Bold /><Italic /><List /><Link2 /><span /><Sparkles /></div><div className="studio-editor-body"><p className="studio-article-category">{copy.words}</p><h3>{copy.articleTitle}</h3><p>{copy.articleBody}</p><div className="studio-article-cover" aria-hidden><CoverArt variant={0} /><span>{siteConfig.name}<br />Kit.</span><ArrowUpRight /></div><p className="studio-editor-last">{copy.articleSecond}<span className="studio-writing-cursor" aria-hidden /></p></div><div className="studio-margin-comment" aria-hidden><span>N</span><div><Check className="size-3" />{copy.saved}</div></div></div>;
}

function CoverArt({ variant }: { variant: number }) {
  return <div className={`studio-cover-art studio-cover-art-${variant}`} aria-hidden><span className="studio-art-disc" /><span className="studio-art-fold" /><span className="studio-art-line" /></div>;
}

function MediaPreview() {
  const { t } = useI18n();
  const [selected, setSelected] = useState(0);
  return <div className="studio-media-preview"><div className="studio-preview-title"><div><p>{t.studio.workspace}</p><h3>{t.studio.library}</h3></div><ImageIcon className="size-6 text-ink" aria-hidden /></div><div className="studio-media-grid">{[0, 1, 2, 3, 4, 5].map((item) => <button className={cn("studio-media-item", selected === item && "is-selected")} key={item} onClick={() => setSelected(item)} aria-pressed={selected === item} aria-label={`${t.studio.select} ${item + 1}`}><CoverArt variant={item % 3} /><span className="studio-media-caption">{t.studio.draft} {item + 1}{selected === item ? <Check className="size-4" /> : <Plus className="size-4" />}</span></button>)}</div><p className="studio-media-selection" role="status"><Check className="size-4" />{t.studio.selected}</p></div>;
}

function PublishPreview() {
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  return <div className="studio-publish-preview"><div className="studio-publish-cover"><CoverArt variant={0} /><span>{t.studio.articleTitle}</span></div><div><p className="studio-article-category">{t.studio.draft}</p><h3>{t.studio.publishTitle}</h3><ul>{t.studio.checks.map((check) => <li key={check}><Check className="size-4" />{check}</li>)}</ul><button className="studio-preview-publish" onClick={() => setReady(true)}>{ready ? <CheckCheck className="size-4" /> : <Globe2 className="size-4" />}{ready ? t.studio.published : t.studio.publishAction}</button></div></div>;
}

function FeatureExplorer() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const reduced = useLandingReducedMotion();
  return <div className="studio-feature-explorer"><div><p className="studio-feature-hint">{t.studio.flowHint}</p><div className="studio-feature-choices">{t.studio.featureTitles.map((title, index) => { const Icon = featureIcons[index]; return <button key={title} aria-pressed={active === index} onClick={() => setActive(index)} className={cn(active === index && "is-active")}><Icon className="size-5" aria-hidden /><span><strong>{title}</strong><span>{t.studio.featureDescriptions[index]}</span></span><ArrowUpRight className="size-5" aria-hidden /></button>; })}</div><Link href={featureHrefs[active]} className="studio-text-link">{t.studio.featureLinks[active]}<ArrowRight className="size-4" aria-hidden /></Link></div><div className="studio-feature-canvas"><AnimatePresence mode="wait" initial={false}><motion.div key={active} initial={reduced ? false : { opacity: 0, scale: .96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: reduced ? 1 : 1.02 }} transition={{ duration: .25 }} className="studio-feature-window"><div className="studio-feature-window-top"><LogoMark className="size-5" /><span>{t.studio.workspace}</span><span className="ms-auto"><MoreHorizontal className="size-4" /></span></div>{active === 0 ? <EditorPreview /> : active === 1 ? <MediaPreview /> : <RolePreview />}</motion.div></AnimatePresence></div></div>;
}

function RolePreview() {
  const { t } = useI18n();
  const [role, setRole] = useState("Admin");
  return <div className="studio-role-preview"><ShieldCheck className="size-10 text-ink" aria-hidden /><h3>{t.access.title}</h3><div className="studio-role-choices" role="group" aria-label={t.access.role}>{["Admin", "User", "Demo"].map((name) => <button key={name} aria-pressed={role === name} onClick={() => setRole(name)}>{name}</button>)}</div><div className="studio-role-permissions">{["posts.read", "posts.create", "posts.publish", "users.manage"].map((permission, index) => <div key={permission}><code>{permission}</code>{role === "Admin" || (role === "Demo" && index === 0) ? <Check className="size-4 text-signal" /> : <span aria-hidden className="studio-permission-empty" />}</div>)}</div><span className="studio-role-caption">{t.studio.example}</span></div>;
}

function AgentConnection() {
  const { t } = useI18n();
  const [connected, setConnected] = useState(false);
  return <div className="studio-agent-scene"><div className="studio-agent-orbit" aria-hidden /><div className="studio-agent-node studio-agent-node-left"><Code2 /><span>MCP</span></div><div className="studio-agent-line" data-connected={connected} aria-hidden /><button className="studio-agent-core" onClick={() => setConnected((value) => !value)} aria-pressed={connected} aria-label={t.site.agents.play}><LogoMark className="size-12" /><span>{connected ? <CheckCheck className="size-5 text-signal" /> : <Plus className="size-5" />}</span></button><div className="studio-agent-line" data-connected={connected} aria-hidden /><div className="studio-agent-node studio-agent-node-right"><FileText /><span>Tiptap</span></div><div className="studio-agent-result" role="status">{connected ? <><Check className="size-4 text-signal" />{t.studio.openNote}</> : <><Sparkles className="size-4 text-ink" />{t.site.agents.play}</>}</div></div>;
}
