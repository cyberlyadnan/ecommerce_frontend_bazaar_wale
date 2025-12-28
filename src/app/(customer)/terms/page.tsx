import { LegalPageLayout } from '@/components/pages/legal/LegalPageLayout';

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      badge="Terms"
      title="Terms of Service"
      subtitle="These terms govern your use of our website and services. By using our platform, you agree to these terms."
      lastUpdated="December 18, 2025"
      sections={[
        {
          title: 'Using Our Services',
          content: [
            'You must provide accurate information and keep your account secure.',
            'You agree not to misuse the platform, attempt unauthorized access, or disrupt services.',
            'We may update features and policies to improve the service.',
          ],
        },
        {
          title: 'Orders & Payments',
          content: [
            'Prices, availability, and minimum order quantities may change without notice.',
            'Payments must be completed using supported methods before orders are processed.',
            'We may cancel or refuse orders in case of suspected fraud or policy violations.',
          ],
        },
        {
          title: 'Vendor / Seller Listings',
          content: [
            'Vendors are responsible for listing accuracy, fulfillment, and compliance.',
            'We may remove listings that violate policies or applicable laws.',
          ],
        },
        {
          title: 'Limitation of Liability',
          content:
            'To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount paid for the relevant order or service.',
        },
        {
          title: 'Changes to These Terms',
          content:
            'We may update these terms from time to time. Continued use of the service after changes means you accept the updated terms.',
        },
      ]}
    />
  );
}


