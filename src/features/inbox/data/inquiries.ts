export type Inquiry = {
  id: string;
  name: string;
  email: string;
  agency: string;
  subject: string;
  message: string;
  themeVersion: string;
  licence: "Single" | "Agency" | "Enterprise";
  receivedAt: string;
  read: boolean;
  archived: boolean;
};

export const inquiries: Inquiry[] = [
  {
    id: "i1",
    name: "Katrin Vogel",
    email: "k.vogel@studio-nord.de",
    agency: "Studio Nord",
    subject: "Agency licence for Nordform",
    message:
      "Hello,\n\nwe are planning to use Nordform for four municipal websites next year. Does the agency licence cover sites we hand over to the client after launch, or do they need their own licence?\n\nWe would also like to know whether BITV 2.0 reports are included.\n\nBest regards,\nKatrin",
    themeVersion: "2.4",
    licence: "Agency",
    receivedAt: "2026-10-18T08:14:00Z",
    read: false,
    archived: false,
  },
  {
    id: "i2",
    name: "Tobias Brandt",
    email: "tobias@brandt-webwerk.de",
    agency: "Brandt Webwerk",
    subject: "Upgrade path from Foundation 1.0 to 1.2",
    message:
      "Hi there, we use Foundation 1.0 for a client. Is there a documented upgrade path to version 1.2, and can we keep our custom content elements?",
    themeVersion: "1.0",
    licence: "Single",
    receivedAt: "2026-10-17T16:40:00Z",
    read: false,
    archived: false,
  },
  {
    id: "i3",
    name: "Aylin Kaya",
    email: "aylin@kreativhaus.at",
    agency: "Kreativhaus",
    subject: "Campus theme demo access",
    message: "Could we get a demo login for the Campus theme backend? Our university client wants to try the editor experience before we commit.",
    themeVersion: "1.0",
    licence: "Enterprise",
    receivedAt: "2026-10-17T09:05:00Z",
    read: false,
    archived: false,
  },
  {
    id: "i4",
    name: "Jan Peters",
    email: "jan.peters@peters-digital.com",
    agency: "Peters Digital",
    subject: "Invoice address change",
    message: "Please update our invoice address to Hafenstraße 12, 20457 Hamburg for all future licences.",
    themeVersion: "2.3",
    licence: "Agency",
    receivedAt: "2026-10-16T11:22:00Z",
    read: false,
    archived: false,
  },
  {
    id: "i5",
    name: "Marie Schulz",
    email: "marie@schulz-medien.de",
    agency: "Schulz Medien",
    subject: "Thanks for the quick fix",
    message: "Just wanted to say the mega menu patch works perfectly. Thanks for turning it around so fast!",
    themeVersion: "2.4",
    licence: "Single",
    receivedAt: "2026-10-14T14:50:00Z",
    read: true,
    archived: false,
  },
  {
    id: "i6",
    name: "Lukas Wagner",
    email: "lukas@wagner-it.de",
    agency: "Wagner IT",
    subject: "Extension compatibility question",
    message: "Does the latest forms extension support our existing form templates? We'd like to keep the current forms working after the update.",
    themeVersion: "1.2",
    licence: "Single",
    receivedAt: "2026-10-12T10:10:00Z",
    read: true,
    archived: false,
  },
];
