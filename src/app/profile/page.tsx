export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileForm } from "@/components/profile-form";
import { PushSubscribe } from "@/components/push-subscribe";

export const metadata = {
  title: "My Profile — Utah Rugby Alumni Network",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth/login");
  }

  const admin = createAdminClient();
  const { data: alumni } = await admin
    .from("alumni")
    .select("*")
    .eq("email", user.email)
    .single();

  if (!alumni) {
    redirect("/join");
  }

  // Referral count — sum signups_attributed across all tokens this alumni owns
  const { data: tokens } = await admin
    .from("forward_tokens")
    .select("signups_attributed")
    .eq("referrer_alumni_id", alumni.id);

  const totalReferrals = tokens?.reduce((sum, t) => sum + (t.signups_attributed ?? 0), 0) ?? 0;

  // Signed photo URL
  let photoSignedUrl: string | null = null;
  if (alumni.photo_url) {
    const { data: signedData } = await admin.storage
      .from("alumni-photos")
      .createSignedUrl(alumni.photo_url, 3600);
    photoSignedUrl = signedData?.signedUrl ?? null;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Page header */}
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <h1 className="text-2xl font-black tracking-tight text-white">My Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your info and privacy settings.
        </p>
      </div>

      <div className="mx-auto max-w-xl px-5 py-8 md:px-10">
        {/* Referral stat */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#CC0000]/15">
            <Users className="size-6 text-[#CC0000]" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-black tabular-nums text-white">{totalReferrals}</p>
            <p className="text-xs text-zinc-500">
              {totalReferrals === 1 ? "teammate" : "teammates"} joined via your forward link
            </p>
          </div>
          <Link
            href="/thanks"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <Share2 className="size-3.5" />
            Forward link
          </Link>
        </div>

        {/* Notifications */}
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Notifications
          </p>
          <PushSubscribe />
        </div>

        {/* Profile form */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Your information
          </p>
          <ProfileForm
            alumni={{
              ...alumni,
              photo_signed_url: photoSignedUrl,
            }}
          />
        </div>
      </div>
    </div>
  );
}
