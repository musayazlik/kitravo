import { Braces, Code2, Layers, PenTool, Table2, Wind } from "lucide-react";
import { getI18n } from "@/i18n/server";

const stack = [
  { name: "Next.js", version: "16", icon: Code2 },
  { name: "React", version: "19", icon: Braces },
  { name: "Tailwind CSS", version: "v4", icon: Wind },
  { name: "shadcn/ui", version: "", icon: Layers },
  { name: "Tiptap", version: "3", icon: PenTool },
  { name: "TanStack", version: "", icon: Table2 },
];

export async function Stack() {
  const { t } = await getI18n();

  return (
    <section
      id="stack"
      aria-label={t.site.stack.label}
      className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-12 pb-2 sm:px-6 sm:pt-16"
    >
      <p className="text-center text-xs tracking-wide text-muted-foreground">
        {t.site.stack.lead}
      </p>
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-12">
        {stack.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-2 text-foreground/75"
          >
            <item.icon
              aria-hidden="true"
              strokeWidth={1.5}
              className="size-5"
            />
            <span className="font-heading text-lg font-semibold tracking-tight">
              {item.name}
            </span>
            {item.version && (
              <span className="self-start pt-0.5 font-mono text-[9px] text-muted-foreground">
                {item.version}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
