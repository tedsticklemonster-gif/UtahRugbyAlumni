export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getHubData } from "@/actions/hub";
import { HomePage } from "@/components/home/home-page";
import { LandingPage } from "@/components/landing/landing-page";
import { fetchSchedule, pickNextGame } from "@/lib/schedule";

export default async function RootPage() {
  const supabase = await createClient();

  // getSession() reads the JWT directly from the cookie — no network call.
  // getUser() makes a live Supabase API call that can intermittently return
  // null even with a valid session, incorrectly showing the public page.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const [hubData, schedule] = await Promise.all([getHubData(), fetchSchedule()]);
    // eslint-disable-next-line react-hooks/purity -- server component, runs once per request
    const nowMs = Date.now();
    const nextGame = schedule ? pickNextGame(schedule.games, nowMs) : null;
    return <HomePage {...hubData} nextGame={nextGame} nowMs={nowMs} />;
  }

  return <LandingPage />;
}
