"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Main, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { useAccess, Can } from "@/components/access/access-provider";
import { AttentionList } from "./components/attention-list";
import { MailCard } from "./components/mail-card";
import { McpActivity } from "./components/mcp-activity";
import { PipelineBand } from "./components/pipeline-band";
import { ReadershipChart } from "./components/readership-chart";
import { StorageCard } from "./components/storage-card";
import { TopPosts } from "./components/top-posts";
import type { Range } from "./data/overview";

export function Dashboard() {
  const [range, setRange] = useState<Range>("30d");
  const { t, plural } = useI18n();
  const { principal } = useAccess();
  const firstName = principal?.name.split(" ")[0] ?? "";

  return (
    <Main>
      <PageHeader
        title={fill(t.dashboard.welcome, { name: firstName })}
        description={t.dashboard.summary}
        actions={
          <>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={range}
              onValueChange={(value) => value && setRange(value as Range)}
              aria-label={t.dashboard.period}
            >
              <ToggleGroupItem value="7d">{plural(t.dashboard.days, 7)}</ToggleGroupItem>
              <ToggleGroupItem value="30d">{plural(t.dashboard.days, 30)}</ToggleGroupItem>
              <ToggleGroupItem value="90d">{plural(t.dashboard.days, 90)}</ToggleGroupItem>
            </ToggleGroup>
            <Can permission="posts.create"><Button asChild>
              <Link href="/panel/posts/new">
                <Plus /> {t.dashboard.newPost}
              </Link>
            </Button></Can>
          </>
        }
      />

      <PipelineBand range={range} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 *:h-full">
          <ReadershipChart range={range} />
        </div>
        <AttentionList />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 *:h-full">
          <MailCard />
        </div>
        <StorageCard />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 *:h-full">
          <TopPosts />
        </div>
        <McpActivity />
      </div>
    </Main>
  );
}
