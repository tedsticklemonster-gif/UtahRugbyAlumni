import webpush from "web-push";
import { createAdminClient } from "./supabase/admin";

let vapidInitialized = false;
function initVapid() {
  if (vapidInitialized) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidInitialized = true;
}

export async function sendPushToAlumni(
  alumniId: string,
  payload: { title: string; body: string; url?: string }
) {
  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("alumni_id", alumniId);

  if (!subs?.length) return;
  initVapid();

  const message = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map((sub) =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          message
        )
        .catch(async (err: { statusCode?: number }) => {
          if (err.statusCode === 410) {
            await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        })
    )
  );
}
