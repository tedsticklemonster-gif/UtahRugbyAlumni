import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
};

const UPDATED = "June 15, 2026";
const CONTACT = "richmwhite@gmail.com";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      <div className="h-1.5 bg-utah-red" />

      <div className="mx-auto max-w-2xl px-5 py-10 md:px-10">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-utah-red">
            Legal
          </p>
          <h1 className="mt-1 text-display text-3xl text-white">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-zinc-500">
            Last updated {UPDATED}
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
          <section>
            <h2 className="text-title-2 mb-2 text-white">
              The deal
            </h2>
            <p>
              This is a private network for University of Utah rugby
              alumni and current players, run by alumni for alumni. By
              using the site, you agree to these terms. If you
              don&rsquo;t, please don&rsquo;t use the site.
            </p>
          </section>

          <section>
            <h2 className="text-title-2 mb-2 text-white">
              Who can join
            </h2>
            <p>
              The directory is for current and former University of Utah
              rugby players, coaches, and staff. We may verify
              membership and remove accounts that don&rsquo;t belong.
            </p>
          </section>

          <section>
            <h2 className="text-title-2 mb-2 text-white">
              Your account
            </h2>
            <p>
              Keep your sign-in link private. You&rsquo;re responsible
              for what happens on your account and for keeping your
              profile info accurate.
            </p>
          </section>

          <section>
            <h2 className="text-title-2 mb-2 text-white">
              Be cool
            </h2>
            <p>
              Don&rsquo;t harass other members. Don&rsquo;t post
              anything illegal, threatening, defamatory, or that
              violates someone&rsquo;s privacy. Don&rsquo;t scrape the
              directory, export contact info in bulk, or use it for
              spam, marketing, or recruiting outside the spirit of the
              network. We can remove content or accounts that break
              these rules.
            </p>
          </section>

          <section>
            <h2 className="text-title-2 mb-2 text-white">
              Your content
            </h2>
            <p>
              You keep ownership of what you post. By posting, you give
              us permission to display it within the network so other
              members can see it.
            </p>
          </section>

          <section>
            <h2 className="text-title-2 mb-2 text-white">
              No warranties
            </h2>
            <p>
              The site is provided as-is. We do our best to keep it up
              and accurate, but we don&rsquo;t guarantee it. We&rsquo;re
              not liable for any damages arising from your use of the
              site, to the fullest extent allowed by law.
            </p>
          </section>

          <section>
            <h2 className="text-title-2 mb-2 text-white">
              Ending it
            </h2>
            <p>
              You can delete your account at any time by emailing{" "}
              <a
                href={`mailto:${CONTACT}`}
                className="text-utah-red underline-offset-2 hover:underline"
              >
                {CONTACT}
              </a>
              . We may suspend accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-title-2 mb-2 text-white">
              Changes
            </h2>
            <p>
              If we update these terms, we&rsquo;ll change the date at
              the top. Continued use of the site means you accept the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-title-2 mb-2 text-white">
              Contact
            </h2>
            <p>
              Email{" "}
              <a
                href={`mailto:${CONTACT}`}
                className="text-utah-red underline-offset-2 hover:underline"
              >
                {CONTACT}
              </a>{" "}
              with any questions.
            </p>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-zinc-900 pt-6 text-xs">
          <Link
            href="/privacy"
            className="text-zinc-500 transition-colors hover:text-white"
          >
            ← Privacy Policy
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
