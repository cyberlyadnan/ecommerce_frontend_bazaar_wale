import { Truck, MapPin, Clock, Shield } from 'lucide-react';

import { SupportPageLayout } from '@/components/pages/support/SupportPageLayout';

export default function ShippingInfoPage() {
  return (
    <SupportPageLayout
      badge="Shipping"
      title="Shipping Information"
      subtitle="Delivery options, timelines, and coverage for your business orders."
      sections={[
        {
          title: 'Delivery Timelines',
          content: [
            'Standard delivery timelines depend on your location and vendor dispatch times.',
            'Bulk shipments may require additional processing and scheduling.',
            'You’ll see the latest status in Track Order / My Orders.',
          ],
        },
        {
          title: 'Shipping Charges',
          content: [
            'Shipping charges (if applicable) are shown at checkout.',
            'Some vendors may offer free shipping above certain order values.',
          ],
        },
        {
          title: 'Damaged or Missing Items',
          content: [
            'If you receive a damaged shipment, report it as soon as possible from your order page.',
            'Provide images and packaging details to speed up resolution.',
          ],
        },
      ]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Multiple delivery options</h3>
              <p className="mt-1 text-sm text-foreground/60">
                Standard and bulk dispatch based on category and vendor.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Coverage</h3>
              <p className="mt-1 text-sm text-foreground/60">
                Shipping availability varies by location and product type.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Live tracking</h3>
              <p className="mt-1 text-sm text-foreground/60">
                Track updates from dispatch to delivery.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Secure handling</h3>
              <p className="mt-1 text-sm text-foreground/60">
                We prioritize safe packing and compliant transport for B2B items.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SupportPageLayout>
  );
}


