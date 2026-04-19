export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getThreadAction } from "@/actions/messages";
import { ThreadClient } from "./thread-client";

interface PageProps {
  params: Promise<{ alumniId: string }>;
}

export default async function ThreadPage({ params }: PageProps) {
  const { alumniId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { messages, partner, myId } = await getThreadAction(alumniId);

  if (!partner) notFound();

  return (
    <ThreadClient
      initialMessages={messages}
      partner={partner}
      myId={myId!}
      partnerId={alumniId}
    />
  );
}
