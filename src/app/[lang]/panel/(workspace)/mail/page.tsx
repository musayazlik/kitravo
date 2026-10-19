import { protectPage } from "@/components/access/protected-page";
import { MailPage } from "@/features/mail/mail-page";
import { titleMetadata } from "@/i18n/server";

export const generateMetadata = titleMetadata((t) => t.nav.items.mail);

function Page() {
  return <MailPage />;
}

export default protectPage("mail.read", Page);
