'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

import { SupportPageLayout } from '@/components/pages/support/SupportPageLayout';

const FAQS = [
  {
    q: 'How do I place a bulk order?',
    a: 'Browse products, select quantity (MOQ applies), and proceed to checkout. For large orders, you can contact support for assistance.',
  },
  {
    q: 'How can I track my order?',
    a: 'Go to Track Order and enter your order ID. You can also view updates in My Orders when logged in.',
  },
  {
    q: 'What is the return policy?',
    a: 'Return eligibility depends on product category and condition. Visit Returns & Refunds for full details and steps.',
  },
  {
    q: 'Do you offer free shipping?',
    a: 'Shipping offers vary by vendor and order value. Any free shipping options will be shown at checkout when applicable.',
  },
  {
    q: 'Can I become a vendor?',
    a: 'Yes. Use the “Become a Vendor” option in the header or profile page to register and start selling.',
  },
] as const;

export default function FAQsPage() {
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <SupportPageLayout
      badge="FAQs"
      title="Frequently Asked Questions"
      subtitle="Quick answers to common questions about orders, shipping, returns, and accounts."
    >
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
          />
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-foreground/70">No results found.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <li key={item.q}>
                  <button
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-muted/20 transition"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <span className="font-bold text-foreground">{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-foreground/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-foreground/70 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SupportPageLayout>
  );
}


