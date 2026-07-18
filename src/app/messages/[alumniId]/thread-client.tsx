"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { AttachPhoto } from "@/components/attach-photo";
import { sendMessageAction, getNewMessagesAction, type Message, type ThreadPartner } from "@/actions/messages";
import { useMe } from "@/components/me-provider";
import { cn } from "@/lib/utils";

function timeOfDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dateSeparator(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

interface ThreadClientProps {
  initialMessages: Message[];
  partner: ThreadPartner;
  myId: string;
  partnerId: string;
}

export function ThreadClient({ initialMessages, partner, myId, partnerId }: ThreadClientProps) {
  const { refetch: refetchMe } = useMe();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, startSend] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSeenRef = useRef<string>(
    initialMessages.length ? initialMessages[initialMessages.length - 1].created_at : new Date().toISOString()
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5s
  useEffect(() => {
    async function poll() {
      const newMsgs = await getNewMessagesAction(partnerId, lastSeenRef.current);
      if (newMsgs.length) {
        setMessages((prev) => [...prev, ...newMsgs]);
        lastSeenRef.current = newMsgs[newMsgs.length - 1].created_at;
        refetchMe(); // update unread count in nav
      }
    }

    pollRef.current = setInterval(poll, 5_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [partnerId, refetchMe]);

  async function handleSend() {
    if (!body.trim() && !photo) return;
    setError(null);
    const fd = new FormData();
    fd.set("body", body);
    if (photo) fd.set("photo", photo);
    const optimisticBody = body;
    setBody("");
    setPhoto(null);

    startSend(async () => {
      const result = await sendMessageAction(partnerId, fd);
      if (result.error) {
        setError(result.error);
        setBody(optimisticBody);
        return;
      }
      // Refresh messages
      const newMsgs = await getNewMessagesAction(partnerId, lastSeenRef.current);
      if (newMsgs.length) {
        setMessages((prev) => [...prev, ...newMsgs]);
        lastSeenRef.current = newMsgs[newMsgs.length - 1].created_at;
      }
    });
  }

  // Group messages by date
  const groups: Array<{ date: string; messages: Message[] }> = [];
  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toDateString();
    const last = groups[groups.length - 1];
    if (!last || last.date !== dateKey) {
      groups.push({ date: dateKey, messages: [msg] });
    } else {
      last.messages.push(msg);
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-surface-0">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/6 px-4 py-3">
        <Link href="/messages" className="text-zinc-500 hover:text-white">
          <ArrowLeft className="size-5" />
        </Link>
        {partner.photo_signed_url ? (
          <img src={partner.photo_signed_url} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-zinc-300">
            {partner.first_name[0]}{partner.last_name[0]}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white">{partner.first_name} {partner.last_name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-xs text-zinc-600">No messages yet. Say hello!</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center py-3">
              <span className="rounded-full bg-surface-2 px-3 py-0.5 text-2xs font-medium text-zinc-500">
                {dateSeparator(group.messages[0].created_at)}
              </span>
            </div>
            {group.messages.map((msg) => {
              const isMe = msg.sender_id === myId;
              return (
                <div key={msg.id} className={cn("flex mb-1", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[75%]", isMe ? "items-end" : "items-start", "flex flex-col gap-0.5")}>
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        isMe
                          ? "rounded-br-sm bg-utah-red/90 text-white"
                          : "rounded-bl-sm bg-surface-2 text-zinc-100"
                      )}
                    >
                      {msg.body && <p className="whitespace-pre-wrap">{msg.body}</p>}
                      {msg.photo_signed_url && (
                        <PhotoLightbox
                          src={msg.photo_signed_url}
                          alt="Message photo"
                          trigger={
                            <img src={msg.photo_signed_url} alt="" className="mt-1.5 max-h-48 rounded-xl object-cover" />
                          }
                        />
                      )}
                    </div>
                    <span className="text-caption px-1 text-2xs">{timeOfDay(msg.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/6 px-4 pb-safe pt-3 pb-4">
        {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-2xl border border-border-strong bg-surface-2 px-3 py-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Message…"
              rows={1}
              className="w-full resize-none bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              style={{ maxHeight: "120px", overflowY: "auto" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="mt-1.5 flex justify-start">
              <AttachPhoto
                onFileReady={setPhoto}
                onClear={() => setPhoto(null)}
              />
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || (!body.trim() && !photo)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-utah-red text-white transition-colors hover:bg-utah-red/90 disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
