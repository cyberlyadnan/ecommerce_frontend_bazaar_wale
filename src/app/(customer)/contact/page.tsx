import Image from 'next/image';
import { Metadata } from 'next';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Headphones,
  Globe,
  Sparkles,
  Send,
  ArrowRight,
  CheckCircle2,
  Building2,
  Users,
  Zap,
} from 'lucide-react';
import { ContactForm } from '@/components/pages/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Ecommerce B2B',
  description: 'Get in touch with us for support, inquiries, or partnership opportunities.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop&q=80"
            alt="Contact us"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white uppercase tracking-wider">
                Get in Touch
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Let's Connect
              <span className="block bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                & Build Together
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
              Have questions? We're here to help. Reach out to us and we'll respond as soon as
              possible.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Email Card */}
            <div className="group relative bg-surface/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Email Us</h3>
                <p className="text-sm text-muted mb-3">Send us an email anytime</p>
                <a
                  href="mailto:bazaarwaleofficial@gmail.com"
                  className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  bazaarwaleofficial@gmail.com
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group relative bg-surface/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Call Us</h3>
                <p className="text-sm text-muted mb-3">Mon-Fri, 9AM-6PM IST</p>
                <a
                  href="tel:+918826920195"
                  className="text-secondary hover:text-secondary/80 font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  +91 88269 20195
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Location Card */}
            <div className="group relative bg-surface/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Visit Us</h3>
                <p className="text-sm text-muted mb-3">Our office location</p>
                <p className="text-foreground/70 font-medium text-sm">
                  Gali No. 5, Ambedkar Basti, Maujpur, <br />Seelampur North East Delhi-110053
                </p>
              </div>
            </div>

            {/* Support Card */}
            <div className="group relative bg-surface/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 mb-4 group-hover:scale-110 transition-transform">
                  <Headphones className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">24/7 Support</h3>
                <p className="text-sm text-muted mb-3">We're always here to help</p>
                <span className="text-foreground/70 font-medium text-sm inline-flex items-center gap-1">
                  Live Chat Available
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Information Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Business Hours Card */}
              <div className="relative bg-surface/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Business Hours</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-foreground/70">Monday - Friday</span>
                      <span className="font-medium text-foreground">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-foreground/70">Saturday</span>
                      <span className="font-medium text-foreground">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/70">Sunday</span>
                      <span className="font-medium text-destructive">Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="relative bg-surface/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-2xl" />
                <div className="relative space-y-4">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Quick Response</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Email Response</p>
                        <p className="text-xs text-muted">Within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Phone Support</p>
                        <p className="text-xs text-muted">During business hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Live Chat</p>
                        <p className="text-xs text-muted">Available 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Contact Us */}
              <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Why Contact Us?
                </h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Get expert product recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Discuss bulk order pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Explore partnership opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Request custom solutions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="relative bg-surface/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-border/50 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Send className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Send us a Message
                      </h2>
                      <p className="text-sm text-muted mt-1">
                        Fill out the form below and we'll get back to you soon
                      </p>
                    </div>
                  </div>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-b from-background to-surface/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Common Questions
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Find quick answers to common questions about our services and platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-border/50 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                How do I become a vendor?
              </h3>
              <p className="text-sm text-foreground/70">
                Simply click on "Become a Vendor" in the header, fill out the registration form,
                and our team will review your application within 2-3 business days.
              </p>
            </div>

            <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-border/50 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                What are the minimum order quantities?
              </h3>
              <p className="text-sm text-foreground/70">
                Minimum order quantities vary by product and vendor. You can find this information
                on each product page. Bulk orders often qualify for discounted pricing.
              </p>
            </div>

            <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-border/50 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Do you ship internationally?
              </h3>
              <p className="text-sm text-foreground/70">
                Yes, we support international shipping. Shipping costs and delivery times vary by
                location. Contact us for specific shipping quotes to your region.
              </p>
            </div>

            <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-border/50 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" />
                How quickly will I receive a response?
              </h3>
              <p className="text-sm text-foreground/70">
                We aim to respond to all inquiries within 24 hours during business days. For urgent
                matters, please call us directly or use our live chat feature.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521791136064-7986b292a710?w=1920&h=1080&fit=crop&q=80"
            alt="Call to action"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/90" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              Ready to Get Started?
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Let's Build Something Great Together
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you're looking to source products, become a vendor, or explore partnership
            opportunities, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register/vendor"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Become a Vendor
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Browse Products
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
