import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPageBySlug } from "@/lib/contentful/contentfulClient";
import { StudioShell } from "@/components/studio/StudioShell";
import type { Role } from "@/types/auth";

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata = { title: "Studio – Page Studio" };

export default async function StudioPage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const role = (session.user as { role?: Role })?.role;
  if (role === "viewer") redirect("/unauthorized");

  let page = null;
  try {
    // Load draft (preview=true) in studio
    page = await getPageBySlug(slug, true);
  } catch {
    // Contentful not configured — use null, studio will show empty state
  }

  return (
    <StudioShell
      initialPage={page}
      slug={slug}
      userRole={role ?? "viewer"}
    />
  );
}
