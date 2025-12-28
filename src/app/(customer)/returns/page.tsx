import { RotateCcw, ShieldCheck, Clock } from 'lucide-react';

import { SupportPageLayout } from '@/components/pages/support/SupportPageLayout';

export default function ReturnsPage() {
  return (
    <SupportPageLayout
      badge="Returns"
      title="Returns & Refunds"
      subtitle="Transparent return rules for business purchases. Learn how to request a return and when to expect refunds."
      sections={[
        {
          title: 'Return Eligibility',
          content: [
            'Items must be unused and in original packaging (where applicable).',
            'Return requests must be initiated within the eligible window for the product.',
            'Some categories may be non-returnable due to safety, hygiene, or regulatory constraints.',
          ],
        },
        {
          title: 'How to Request a Return',
          content: [
            'Go to “My Orders” and select the order item you want to return.',
            'Choose a reason, add notes/photos if needed, and submit.',
            'Our team will confirm pickup/inspection steps based on the item type.',
          ],
        },
        {
          title: 'Refund Timeline',
          content: [
            'Once inspection is complete, refunds are processed to the original payment method.',
            'Bank processing may take additional time depending on your provider.',
          ],
        },
      ]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-primary" />
          </div>
          <h3 className="mt-4 font-bold text-foreground">Easy Returns</h3>
          <p className="mt-2 text-sm text-foreground/60">
            Start a return in a few steps from your orders page.
          </p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <h3 className="mt-4 font-bold text-foreground">Policy Clarity</h3>
          <p className="mt-2 text-sm text-foreground/60">
            Clear eligibility rules for each product category.
          </p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="mt-4 font-bold text-foreground">Fast Refunds</h3>
          <p className="mt-2 text-sm text-foreground/60">
            Refunds are processed after verification/inspection.
          </p>
        </div>
      </div>
    </SupportPageLayout>
  );
}


