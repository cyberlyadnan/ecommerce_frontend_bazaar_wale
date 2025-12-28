import { LegalPageLayout } from '@/components/pages/legal/LegalPageLayout';

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      badge="Disclaimer"
      title="Disclaimer"
      subtitle="Please read this disclaimer carefully. It explains limitations and responsibilities related to using our platform."
      lastUpdated="December 18, 2025"
      sections={[
        {
          title: 'General Information',
          content:
            'Content on this platform is provided for general information purposes. While we aim to keep information accurate and up to date, we make no warranties about completeness, reliability, or suitability.',
        },
        {
          title: 'Product Listings & Vendor Responsibility',
          content: [
            'Vendors are responsible for product descriptions, pricing, and fulfillment details.',
            'Images may be illustrative; actual product appearance may vary.',
            'We do not guarantee vendor performance beyond applicable platform policies.',
          ],
        },
        {
          title: 'No Professional Advice',
          content:
            'Nothing on this site constitutes legal, financial, or professional advice. You should seek appropriate professional guidance for your specific situation.',
        },
        {
          title: 'External Links',
          content:
            'Our platform may contain links to third-party sites. We do not control and are not responsible for the content, policies, or practices of any third parties.',
        },
        {
          title: 'Limitation of Liability',
          content:
            'To the fullest extent permitted by law, we disclaim liability for any losses or damages arising from your use of the platform, including indirect or consequential losses.',
        },
      ]}
    />
  );
}


