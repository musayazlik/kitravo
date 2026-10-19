import { ArrowRight, Check, Terminal } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CopyButton } from "@/components/copy-button";
import { fill } from "@/i18n/format";
import { getI18n } from "@/i18n/server";

const commands = ["pnpm install", "cp .env.example .env", "pnpm dev"];

export async function GetStarted() {
  const { t } = await getI18n();
  const start = t.site.start;
  const steps = start.steps.map((step, index) => ({ ...step, command: commands[index] }));

  return (
    <section
      id="start"
      aria-labelledby="start-title"
      className="scroll-mt-24 px-5 py-20 sm:px-6 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="landing-eyebrow">{start.eyebrow}</p>
            <h2
              id="start-title"
              className="mt-4 max-w-xl text-4xl leading-[1.1] font-medium tracking-[-0.04em] sm:text-5xl"
            >
              {start.title1}
              <br />
              {start.title2}
            </h2>
          </div>
          <Link
            href="/panel/dashboard"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink"
          >
            {start.look}{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex min-w-0 flex-col rounded-2xl border bg-paper/50 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink">0{index + 1}</span>
                <Terminal
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              </div>
              <h3 className="mt-7 text-xl font-medium">{step.title}</h3>
              <p className="mt-3 mb-6 text-sm leading-6 text-muted-foreground">
                {step.text}
              </p>
              <div className="mt-auto flex min-w-0 items-center gap-2 rounded-lg border bg-background py-2 pe-2 ps-3">
                <span aria-hidden="true" className="font-mono text-xs text-ink">
                  $
                </span>
                <code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs">
                  {step.command}
                </code>
                <CopyButton
                  className="size-11 shrink-0"
                  value={step.command}
                  label={fill(start.copy, { command: step.command })}
                />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Check aria-hidden="true" className="size-3.5 text-signal" /> {start.note}
        </p>
      </div>
    </section>
  );
}
