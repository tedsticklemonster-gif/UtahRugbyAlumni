import { Suspense } from "react";
import { SignupForm } from "@/components/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Join — Utah Rugby Alumni Network",
  description: "Sign up to join the Utah Rugby Alumni Network.",
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Join the Network</CardTitle>
          <CardDescription>
            Takes about 2 minutes. Only your name, graduation year, and position
            are visible publicly — everything else is private.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <SignupForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
