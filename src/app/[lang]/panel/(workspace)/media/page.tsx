import { protectPage } from "@/components/access/protected-page";
import { Suspense } from "react";
import { MediaPage } from "@/features/media/media-page";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.media);

async function Media({ searchParams }: { searchParams: PageProps<"/[lang]/panel/media">["searchParams"] }) {
  const { upload } = await searchParams;
  return <MediaPage openUpload={upload === "1"} />;
}

function Page({ searchParams }: PageProps<"/[lang]/panel/media">) {
  return (
    <Suspense>
      <Media searchParams={searchParams} />
    </Suspense>
  );
}

export default protectPage("media.read", Page);
