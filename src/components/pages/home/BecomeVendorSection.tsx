import Link from 'next/link';
import { Store, TrendingUp, Users, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function BecomeVendorSection() {
  const benefits = [
    {
      icon: Store,
      title: 'Expand Your Reach',
      description: 'Access thousands of B2B buyers looking for quality products',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Increase sales and revenue with our powerful marketplace platform',
    },
    {
      icon: Users,
      title: 'Build Relationships',
      description: 'Connect with enterprise buyers and establish long-term partnerships',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Get paid on time with our secure payment and settlement system',
    },
  ];

  return (
    <>
      {/* Professional Divider */}
      <div className="relative w-full h-px bg-gradient-to-r from-transparent via-border to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-primary rounded-full" />
      </div>
      
      <section className="relative py-8 md:py-12 overflow-hidden bg-surface/50">
        <div className="absolute inset-0 bg-primary/5" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold">
                <Store className="w-4 h-4 text-primary" />
                <span className="text-primary">Vendor Program</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Become a Vendor and{' '}
                <span className="text-secondary">Grow Your Business</span>
              </h2>
              
              <p className="text-lg text-foreground/70 leading-relaxed">
                Join our B2B marketplace and reach thousands of enterprise buyers. 
                Manage your products, track orders, and grow your wholesale business 
                with our comprehensive vendor platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register/vendor"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/vendor/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Content - Benefits Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-surface rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-border/50 hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      
      {/* Professional Divider */}
      <div className="relative w-full h-px bg-gradient-to-r from-transparent via-border to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-primary rounded-full" />
      </div>
    </>
  );
}

