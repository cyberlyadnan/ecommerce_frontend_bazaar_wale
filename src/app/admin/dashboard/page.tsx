export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Total Revenue', value: '₹12.4M', change: '+8.4% vs last month' },
          { title: 'Active Vendors', value: '312', change: '+12 onboarded' },
          { title: 'Pending Approvals', value: '18', change: 'Applications awaiting review' },
          { title: 'Disputed Orders', value: '5', change: 'Resolve within 24h' },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm text-muted">{card.title}</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{card.value}</p>
            <p className="mt-2 text-xs font-medium text-muted">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Vendor pipeline</h2>
              <p className="text-sm text-muted">Monitor onboarding stages for new partners</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Weekly snapshot
            </span>
          </header>

          <div className="mt-6 space-y-5">
            {[
              { label: 'Submitted applications', value: '42', progress: 'w-2/3' },
              { label: 'KYC in review', value: '24', progress: 'w-1/2' },
              { label: 'Approved vendors', value: '18', progress: 'w-2/5' },
            ].map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between text-sm font-medium text-foreground">
                  <span>{stage.label}</span>
                  <span className="text-muted">{stage.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted/20">
                  <div className={`h-full rounded-full bg-primary ${stage.progress}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Payment health</h2>
              <p className="text-sm text-muted">Track settlement status across vendors</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
              On track
            </span>
          </header>

          <div className="mt-6 grid gap-5">
            {[
              { title: 'Upcoming payouts', amount: '₹4.8M', subtext: 'Due in next 7 days' },
              { title: 'Outstanding invoices', amount: '₹1.2M', subtext: 'Escalate if overdue > 14 days' },
              { title: 'Refund requests', amount: '₹320k', subtext: 'Requires finance review' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{item.amount}</p>
                <p className="text-xs text-muted">{item.subtext}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

