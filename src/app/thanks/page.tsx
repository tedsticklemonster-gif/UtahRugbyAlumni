import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Thanks — Utah Rugby Alumni Network",
};

export default function ThanksPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">You&apos;re in!</CardTitle>
          <CardDescription>
            Check your email for a verification link. Once verified, you&apos;ll
            be able to see photos, bios, and LinkedIn profiles of other alumni.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border p-4 bg-muted/50">
            <p className="text-sm font-medium">Help us grow the network</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Utah Rugby has almost no contact info for alumni. If you could
              forward this to every rugby player in your phone, we&apos;ll get
              connected way faster.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/directory"
              className={buttonVariants({ variant: "outline" })}
            >
              Browse Directory
            </Link>
            <Link href="/" className={buttonVariants({ variant: "ghost" })}>
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
