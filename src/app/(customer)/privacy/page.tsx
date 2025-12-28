import { LegalPageLayout } from '@/components/pages/legal/LegalPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      badge="Privacy"
      title="Privacy Policy"
      subtitle="We respect your privacy. This policy explains what information we collect, how we use it, and the choices you have."
      lastUpdated="December 18, 2025"
      sections={[
        {
          title: 'Information We Collect',
          content: [
            'Account details (such as name, email, phone) when you create an account.',
            'Order and transaction information when you purchase products.',
            'Usage data (pages visited, interactions) to improve performance and experience.',
            'Device and browser information (IP address, device identifiers) for security and analytics.',
          ],
        },
        {
          title: 'How We Use Your Information',
          content: [
            'To provide and maintain our services (checkout, order tracking, support).',
            'To communicate with you about your account, orders, and important updates.',
            'To prevent fraud, abuse, and unauthorized access.',
            'To improve product discovery, search relevance, and overall UX.',
          ],
        },
        {
          title: 'Sharing & Disclosure',
          content: [
            'We may share information with vendors/sellers to fulfill your orders.',
            'We may use service providers (payments, shipping, analytics) under contractual safeguards.',
            'We may disclose information if required by law or to protect our rights and users.',
          ],
        },
        {
          title: 'Your Choices',
          content: [
            'You can update your profile details from your account settings.',
            'You can opt out of non-essential communications where applicable.',
            'You can request access, correction, or deletion of your data (subject to legal requirements).',
          ],
        },
        {
          title: 'Data Security',
          content:
            'We implement reasonable technical and organizational measures to protect your information. No method of transmission or storage is 100% secure, but we continuously improve our security posture.',
        },
      ]}
    />
  );
}


