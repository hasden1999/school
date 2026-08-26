import { getSession } from "@/lib/auth";
import { SchoolWelcomePortal } from "@/components/landing/SchoolWelcomePortal";

export const revalidate = 0;

export default async function HomePage() {
  const session = await getSession();

  return <SchoolWelcomePortal initialSession={session} />;
}
