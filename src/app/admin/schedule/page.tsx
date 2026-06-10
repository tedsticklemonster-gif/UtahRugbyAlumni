export const dynamic = "force-dynamic";

import { AdminPage } from "@/components/admin/AdminPage";
import { ScheduleAdmin } from "@/components/admin/ScheduleAdmin";
import { listScheduleGames } from "@/actions/schedule";

export const metadata = { title: "Game Schedule — Admin" };

export default async function ScheduleAdminPage() {
  const games = await listScheduleGames();

  return (
    <AdminPage
      title="Game Schedule"
      description="Manage the season game schedule. These games appear on the homepage and schedule page."
    >
      <ScheduleAdmin games={games} />
    </AdminPage>
  );
}
