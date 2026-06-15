import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
};

const UPDATED = "June 15, 2026";
const CONTACT = "richmwhite@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="h-1.5 bg-[#CC0000]" />

      <div className="mx-auto max-w-2xl px-5 py-10 md:px-10">
        <header className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
            Legal
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-zinc-500">
            Last updated {UPDATED}
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
          <section>
            <h2 className="mb-2 text-base font-bold text-white">
              Who we are
            </h2>
            <p>
              The University of Utah Rugby Alumni Network
              (&ldquo;we,&rdquo; &ldquo;us&rdquo;) is a private,
              alumni-run directory for former and current University of
              Utah rugby players. We are not affiliated with the
              University of Utah.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">
              What we collect
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Profile info you provide: name, grad year, email, phone,
                photo, bio, LinkedIn, employer, services offered.
              </li>
              <li>
                Content you post: messages, event RSVPs, comments, and
                photos.
              </li>
              <li>
                Basic technical data needed to run the site: IP address,
                browser type, and session cookies for sign-in.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">
              How we use it
            </h2>
            <p>
              We use your info to run the directory, let teammates find
              you, send you the occasional digest or event reminder, and
              keep the network secure. We don&rsquo;t sell your data and
              we don&rsquo;t run ads.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">
              Who can see your info
            </h2>
            <p>
              Profile details are visible only to other verified alumni
              who have signed in. You control what shows publicly on
              your profile and can hide your phone, email, or LinkedIn
              at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">
              Third parties
            </h2>
            <p>
              We rely on a few service providers to make the site work:
              Supabase (database and auth), Vercel (hosting), and Resend
              (email delivery). They process data on our behalf under
              their own privacy terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">
              Your choices
            </h2>
            <p>
              You can edit your profile, opt out of emails, or ask us to
              delete your account at any time. Email{" "}
              <a
                href={`mailto:${CONTACT}`}
                className="text-[#CC0000] underline-offset-2 hover:underline"
              >
                {CONTACT}
              </a>{" "}
              and we&rsquo;ll take care of it.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">
              Changes
            </h2>
            <p>
              If we update this policy, we&rsquo;ll change the date at
              the top. Material changes will be announced in the feed.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">
              Contact
            </h2>
            <p>
              Questions? Email{" "}
              <a
                href={`mailto:${CONTACT}`}
                className="text-[#CC0000] underline-offset-2 hover:underline"
              >
                {CONTACT}
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-zinc-900 pt-6 text-xs">
          <Link
            href="/terms"
            className="text-zinc-500 transition-colors hover:text-white"
          >
            Terms of Service →
          </Link>
          <Link
            href="/"
            className="text-zinc-500 transition-colors hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
