"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

export type ScheduleGame = {
  id: string;
  opponent: string;
  game_date: string;
  location: "Home" | "Away" | "Neutral";
  result: "Win" | "Loss" | "Draw" | null;
  score: string | null;
  man_of_match: string | null;
  notes: string | null;
};

export async function listScheduleGames(): Promise<ScheduleGame[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("game_schedule")
    .select("id, opponent, game_date, location, result, score, man_of_match, notes")
    .order("game_date", { ascending: true });
  return (data ?? []) as ScheduleGame[];
}

export async function listUpcomingGames(): Promise<ScheduleGame[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("game_schedule")
    .select("id, opponent, game_date, location, result, score, man_of_match, notes")
    .gte("game_date", new Date().toISOString())
    .is("result", null)
    .order("game_date", { ascending: true });
  return (data ?? []) as ScheduleGame[];
}

export async function createScheduleGame(formData: FormData): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Not authorized" };
  }

  const opponent = (formData.get("opponent") as string)?.trim();
  if (!opponent) return { error: "Opponent is required" };

  const game_date = formData.get("game_date") as string;
  if (!game_date) return { error: "Game date is required" };

  const location = (formData.get("location") as string) || "Away";
  const result = (formData.get("result") as string) || null;
  const score = (formData.get("score") as string)?.trim() || null;
  const man_of_match = (formData.get("man_of_match") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const admin = createAdminClient();
  const { error } = await admin.from("game_schedule").insert({
    opponent,
    game_date,
    location,
    result: result || null,
    score,
    man_of_match,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/schedule");
  revalidatePath("/events");
  revalidatePath("/");
  return {};
}

export async function updateScheduleGame(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Not authorized" };
  }

  const opponent = (formData.get("opponent") as string)?.trim();
  if (!opponent) return { error: "Opponent is required" };

  const game_date = formData.get("game_date") as string;
  if (!game_date) return { error: "Game date is required" };

  const location = (formData.get("location") as string) || "Away";
  const result = (formData.get("result") as string) || null;
  const score = (formData.get("score") as string)?.trim() || null;
  const man_of_match = (formData.get("man_of_match") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const admin = createAdminClient();
  const { error } = await admin
    .from("game_schedule")
    .update({
      opponent,
      game_date,
      location,
      result: result || null,
      score,
      man_of_match,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/schedule");
  revalidatePath("/events");
  revalidatePath("/");
  return {};
}

export async function deleteScheduleGame(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Not authorized" };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("game_schedule").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/schedule");
  revalidatePath("/events");
  revalidatePath("/");
  return {};
}
