// components/Footer/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck,
  HeadphonesIcon
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
    shop: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/categories' },
      { label: 'New Arrivals', href: '/new-arrivals' },
      { label: 'Best Sellers', href: '/best-sellers' },
      // { label: 'Special Offers', href: '/deals' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Track Order', href: '/track-order' },
      { label: 'Returns', href: '/returns' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'FAQs', href: '/faqs' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over $50',
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% protected',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Dedicated support',
    },
    {
      icon: CreditCard,
      title: 'Easy Returns',
      description: '30-day guarantee',
    },
  ];

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      {/* Features Section */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <div className="relative w-40 h-20 sm:w-32 sm:h-20 md:w-40 md:h-28">
                <Image
                  src="/logo.png"
                  alt="Bazaarwale"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
            <p className="text-muted text-sm md:text-base mb-6 leading-relaxed">
              Your trusted partner for quality products and exceptional service. Building lasting relationships through excellence.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="mailto:support@b2bcommerce.com" 
                className="flex items-center gap-3 text-muted hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">support@b2bcommerce.com</span>
              </a>
              
              <a 
                href="tel:+1234567890" 
                className="flex items-center gap-3 text-muted hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">+1 (234) 567-890</span>
              </a>
              
              <div className="flex items-start gap-3 text-muted">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">123 Business Street, Suite 100<br />New York, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className='flex flex-col gap-2 items-start' >
            <h3 className="font-semibold text-foreground text-base md:text-lg mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-left">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-muted hover:text-primary transition-colors text-sm md:text-base inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Links */}
          <div className='flex flex-col gap-2 items-start'>
            <h3 className="font-semibold text-foreground text-base md:text-lg mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-left">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-muted hover:text-primary transition-colors text-sm md:text-base inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className='flex flex-col gap-2 items-start '>
            <h3 className="font-semibold text-foreground text-base md:text-lg mb-4">
              Support
            </h3>
            <ul className="space-y-2.5 text-left">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-muted hover:text-primary transition-colors text-sm md:text-base inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-foreground text-base md:text-lg mb-4">
              Newsletter
            </h3>
            <p className="text-muted text-sm mb-4">
              Subscribe to get special offers and updates.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm transition-all"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-muted text-sm text-center md:text-left">
              © {currentYear} Bazaarwale. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted hover:text-primary transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-all group"
                  >
                    <Icon className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-background/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-muted text-xs md:text-sm font-medium">
              Secure Payment Methods:
            </span>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {['Visa', 'Mastercard', 'AmEx', 'PayPal', 'Stripe'].map((method) => (
                <div
                  key={method}
                  className="px-3 py-1.5 bg-surface border border-border rounded text-xs font-semibold text-muted hover:border-primary transition-colors"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}