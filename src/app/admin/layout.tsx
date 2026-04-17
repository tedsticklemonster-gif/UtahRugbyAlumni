import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-6 flex items-center gap-4 border-b pb-4">
        <span className="text-sm font-semibold text-muted-foreground">
          Admin
        </span>
        <Link
          href="/admin"
          className="text-sm hover:text-foreground text-muted-foreground"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/roster"
          className="text-sm hover:text-foreground text-muted-foreground"
        >
          Roster
        </Link>
        <Link
          href="/admin/import"
          className="text-sm hover:text-foreground text-muted-foreground"
        >
          Import
        </Link>
        <Link
          href="/admin/email"
          className="text-sm hover:text-foreground text-muted-foreground"
        >
          Email
        </Link>
        <Link
          href="/admin/tokens"
          className="text-sm hover:text-foreground text-muted-foreground"
        >
          Tokens
        </Link>
        <Link
          href="/admin/access"
          className="text-sm hover:text-foreground text-muted-foreground"
        >
          Access
        </Link>
      </nav>
      {children}
    </div>
  );
}
