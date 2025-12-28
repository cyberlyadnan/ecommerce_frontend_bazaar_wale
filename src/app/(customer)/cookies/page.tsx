import { LegalPageLayout } from '@/components/pages/legal/LegalPageLayout';

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      badge="Cookies"
      title="Cookie Policy"
      subtitle="Cookies help us run the site, improve performance, and personalize your experience. This page explains what we use and why."
      lastUpdated="December 18, 2025"
      sections={[
        {
          title: 'What Are Cookies?',
          content:
            'Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve functionality.',
        },
        {
          title: 'How We Use Cookies',
          content: [
            'Essential cookies for login sessions and security protections.',
            'Preference cookies to remember settings (where applicable).',
            'Analytics cookies to understand usage and improve pages and search.',
          ],
        },
        {
          title: 'Managing Cookies',
          content: [
            'You can control cookies in your browser settings (block, delete, or limit).',
            'Disabling cookies may impact some site features like login or cart behavior.',
          ],
        },
        {
          title: 'Third-Party Cookies',
          content:
            'Some features may rely on third-party services (for example, analytics or payment providers). These providers may set cookies according to their own policies.',
        },
      ]}
    />
  );
}


