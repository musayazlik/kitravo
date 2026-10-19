import { protectPage } from "@/components/access/protected-page";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPost } from "@/features/posts/data/posts";
import { PostEditor } from "@/features/posts/post-editor";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.editor.editTitle);

async function EditPost({ params }: { params: PageProps<"/[lang]/panel/posts/[id]">["params"] }) {
  const { id } = await params;
  const post = getPost(id);
  if (!post) notFound();
  return <PostEditor post={post} />;
}

function EditPostPage({ params }: PageProps<"/[lang]/panel/posts/[id]">) {
  return (
    <Suspense>
      <EditPost params={params} />
    </Suspense>
  );
}

export default protectPage("posts.update", EditPostPage);
