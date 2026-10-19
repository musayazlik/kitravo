import { protectPage } from "@/components/access/protected-page";
import { PostEditor } from "@/features/posts/post-editor";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.editor.newTitle);

function NewPostPage() {
  return <PostEditor />;
}

export default protectPage("posts.create", NewPostPage);
