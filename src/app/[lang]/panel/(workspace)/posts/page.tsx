import { protectPage } from "@/components/access/protected-page";
import { Suspense } from "react";
import { TablePageSkeleton } from "@/components/page-skeleton";
import { PostsPage } from "@/features/posts/posts-page";
import { postStatuses, type PostStatus } from "@/features/posts/data/schema";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.posts.list.title);

/** Reads ?status= (URL data) inside Suspense so the page shell stays prefetchable. */
async function FilteredPosts({ searchParams }: { searchParams: PageProps<"/[lang]/panel/posts">["searchParams"] }) {
  const { status } = await searchParams;
  const initial = postStatuses.includes(status as PostStatus) ? (status as PostStatus) : undefined;
  return <PostsPage status={initial} />;
}

function Page({ searchParams }: PageProps<"/[lang]/panel/posts">) {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <FilteredPosts searchParams={searchParams} />
    </Suspense>
  );
}

export default protectPage("posts.read", Page);
