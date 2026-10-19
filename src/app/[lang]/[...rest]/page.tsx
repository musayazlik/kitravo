import { notFound } from "next/navigation";

/** Unknown paths under a language render that language's `not-found.tsx` instead of a bare 404. */
export default function CatchAll() {
  notFound();
}
