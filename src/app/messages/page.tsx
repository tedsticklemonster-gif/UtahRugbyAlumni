export const dynamic = "force-dynamic";

import { relativeTime } from "@/lib/time";
import Link from "next/link";
import { MemberAvatar } from "@/components/member-avatar";
import { redirect } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getConversationsAction } from "@/actions/messages";

export const metadata = {
  title: "Messages — Utah Rugby Alumni Network",
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { conversations } = await getConversationsAction();

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="border-b border-white/6 px-5 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Home
        </Link>
        <h1 className="mt-3 text-title-1 text-white">Messages</h1>
      </div>

      <div className="mx-auto max-w-xl divide-y divide-zinc-800">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
              <MessageCircle className="size-8 text-zinc-600" />
            </div>
            <p className="text-sm font-semibold text-zinc-400">No messages yet</p>
            <p className="text-xs text-zinc-600">
              Find a teammate in the{" "}
              <Link href="/network" className="text-zinc-400 underline hover:text-white">
                directory
              </Link>{" "}
              and send them a message.
            </p>
          </div>
        )}

        {conversations.map((conv) => (
          <Link
            key={conv.other_id}
            href={`/messages/${conv.other_id}`}
            className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-1"
          >
            <MemberAvatar
              photoUrl={conv.other_photo_signed_url}
              firstName={conv.other_first_name}
              lastName={conv.other_last_name}
              size="lg"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-white">
                  {conv.other_first_name} {conv.other_last_name}
                </p>
                <span className="shrink-0 text-2xs text-zinc-500">
                  {relativeTime(conv.last_message_at)}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-zinc-500">
                {conv.last_sent_by_me ? "You: " : ""}
                {conv.last_message_body}
              </p>
            </div>

            {conv.unread_count > 0 && (
              <div className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-utah-red px-1.5 text-2xs font-bold text-white">
                {conv.unread_count > 9 ? "9+" : conv.unread_count}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Link to find people to message */}
      {conversations.length > 0 && (
        <div className="px-5 py-4 text-center">
          <Link href="/network" className="text-xs font-semibold text-zinc-500 hover:text-white">
            Find more teammates to message →
          </Link>
        </div>
      )}
    </div>
  );
}
