import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { count: alumniCount } = await supabase
    .from("alumni")
    .select("*", { count: "exact", head: true })
    .eq("verified", true);

  const { data: states } = await supabase
    .from("alumni")
    .select("state")
    .eq("verified", true)
    .not("state", "is", null);

  const uniqueStates = new Set(states?.map((r) => r.state)).size;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Utah Rugby Alumni Network
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Decades of Utah Rugby history, one place to stay connected. Find out
          who played when, see what everyone&apos;s up to, and help us build the
          network.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/join" className={buttonVariants({ size: "lg" })}>
            Join the Network
          </Link>
          <Link
            href="/directory"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Browse Directory
          </Link>
        </div>
        {(alumniCount ?? 0) > 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {alumniCount}
            </span>{" "}
            alumni registered
            {uniqueStates > 1 && (
              <>
                {" · "}
                <span className="font-semibold text-foreground">
                  {uniqueStates}
                </span>{" "}
                states represented
              </>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
