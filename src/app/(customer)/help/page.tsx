import Link from 'next/link';
import { ArrowRight, Search, Package, Truck, RotateCcw, CreditCard } from 'lucide-react';

import { SupportPageLayout } from '@/components/pages/support/SupportPageLayout';

const QUICK_LINKS = [
  { title: 'Track an order', href: '/track-order', icon: Truck, desc: 'Check shipping and delivery status' },
  { title: 'Returns & refunds', href: '/returns', icon: RotateCcw, desc: 'Return policy and refund timeline' },
  { title: 'Shipping info', href: '/shipping', icon: Package, desc: 'Delivery methods and coverage' },
  { title: 'FAQs', href: '/faqs', icon: CreditCard, desc: 'Common questions, quick answers' },
] as const;

export default function HelpCenterPage() {
  return (
    <SupportPageLayout
      badge="Help Center"
      title="Help Center"
      subtitle="Find answers fast. Browse popular topics, track orders, and learn about shipping and returns."
    >
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground">Search support</h2>
            <p className="text-sm text-foreground/60">Try keywords like “refund”, “delivery”, “invoice”.</p>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
          >
            Browse FAQs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-surface rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/60">{item.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </SupportPageLayout>
  );
}


