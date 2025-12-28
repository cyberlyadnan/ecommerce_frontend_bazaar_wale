import Link from 'next/link';

const preferences = [
  {
    title: 'Shipping pricing',
    description: 'Set a global shipping fee and free-shipping threshold used at checkout.',
    href: '/admin/settings/shipping',
  },
  {
    title: 'Security',
    description: 'Enforce MFA, session timeouts, and audit log retention for admin accounts.',
    href: '/admin/settings',
  },
  {
    title: 'Notifications',
    description: 'Configure payout alerts, vendor escalation emails, and weekly KPI summaries.',
    href: '/admin/settings',
  },
  {
    title: 'Marketplace policy',
    description: 'Manage compliance rules, product eligibility, and onboarding checklists.',
    href: '/admin/settings',
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Platform settings</h1>
        <p className="text-sm text-muted">
          Centralise operations controls, fine-tune access, and align governance with business policy.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {preferences.map((pref) => (
          <article key={pref.title} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">{pref.title}</h2>
            <p className="mt-2 text-sm text-muted">{pref.description}</p>
            <Link
              href={pref.href}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
            >
              Configure
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Team access control</h2>
        <p className="mt-1 text-sm text-muted">Assign admin capabilities to functional owners for finance, ops, and support.</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {[
            { role: 'Finance', scope: 'Payments, settlements, refunds', owners: 4 },
            { role: 'Operations', scope: 'Vendors, listings, compliance', owners: 6 },
            { role: 'Support', scope: 'Orders, tickets, adjustments', owners: 5 },
          ].map((team) => (
            <div key={team.role} className="rounded-xl border border-border/70 bg-background/70 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">{team.role} desk</p>
              <p className="mt-1 text-xs text-muted">{team.scope}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-muted/70">Owners</p>
              <p className="text-lg font-semibold text-foreground">{team.owners}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


