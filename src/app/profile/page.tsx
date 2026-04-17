import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileForm } from "@/components/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  // Generate a signed URL for the photo if one exists
  let photoSignedUrl: string | null = null;
  if (alumni.photo_url) {
    const { data: signedData } = await admin.storage
      .from("alumni-photos")
      .createSignedUrl(alumni.photo_url, 3600); // 1 hour expiry
    photoSignedUrl = signedData?.signedUrl ?? null;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Profile</CardTitle>
          <CardDescription>
            Update your info. Only your name, grad year, position, profession,
            company, city, and state are visible publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            alumni={{
              ...alumni,
              photo_signed_url: photoSignedUrl,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
