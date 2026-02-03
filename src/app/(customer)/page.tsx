import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Star,
  Package,
  Globe,
  Clock,
} from 'lucide-react';

import type { Metadata } from 'next';
import HeroSection from '@/components/pages/home/HeroSection';
import ProductShowcase from '@/components/pages/home/ProductShowcase';
import BecomeVendorSection from '@/components/pages/home/BecomeVendorSection';
import { getFeaturedProducts } from '@/services/serverProducts';
import { getCategories } from '@/services/serverCategories';
import { CategoriesShowcase } from '@/components/pages/home/CategoriesShowcase';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Home',
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default async function CustomerHomePage() {
  let products: any[] = [];
  let topLevelCategories: any[] = [];
  
  try {
    products = await getFeaturedProducts(8);
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
  }
  
  try {
    const categoriesData = await getCategories();
    topLevelCategories = categoriesData.categories
      .filter((cat) => !cat.parent && cat.isActive)
      .slice(0, 8); // Show top 8 categories
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products Section */}
      <ProductShowcase
        products={products}
        title="Featured Products"
        description="Hand-picked products from verified vendors, curated for quality and value"
      />

      {/* Categories Showcase */}
      <CategoriesShowcase categories={topLevelCategories} />

      {/* Professional Divider */}
      <div className="relative w-full h-px bg-gradient-to-r from-transparent via-border to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-primary rounded-full" />
      </div>

      {/* Features Section */}
      <section className="relative py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-surface/20" />
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Succeed in Bazaarwale
              </span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              A comprehensive platform designed to streamline your procurement, connect with verified
              vendors, and scale your business operations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Vendors',
                description: 'All vendors are thoroughly verified and vetted for quality and reliability',
                gradient: 'from-blue-500/20 to-indigo-500/20',
                iconColor: 'text-blue-500',
              },
              {
                icon: Zap,
                title: 'Fast Processing',
                description: 'Streamlined workflows and automated processes for faster transactions',
                gradient: 'from-yellow-500/20 to-orange-500/20',
                iconColor: 'text-yellow-500',
              },
              {
                icon: Globe,
                title: 'Global Reach',
                description: 'Access suppliers and buyers from around the world in one platform',
                gradient: 'from-green-500/20 to-teal-500/20',
                iconColor: 'text-green-500',
              },
              {
                icon: Award,
                title: 'Quality Assured',
                description: 'Rigorous quality checks and standards for all products and services',
                gradient: 'from-purple-500/20 to-pink-500/20',
                iconColor: 'text-purple-500',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-surface/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                      <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Professional Divider */}
      <div className="relative w-full h-px bg-gradient-to-r from-transparent via-border to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-primary rounded-full" />
      </div>

      {/* Stats Section */}
      <section className="relative py-8 md:py-12 overflow-hidden bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Professional Modern Heading */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Our Impact
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Trusted by Businesses
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Join thousands of satisfied customers who trust Bazaarwale for their B2B needs
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '20+', label: 'Verified Vendors', icon: Users },
              { value: '50+', label: 'Products', icon: Package },
              { value: '1', label: 'Countries', icon: Globe },
              { value: '99.9%', label: 'Uptime', icon: Clock },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center group relative bg-surface/80 backdrop-blur-xl rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Professional Divider */}
      <div className="relative w-full h-px bg-gradient-to-r from-transparent via-border to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-primary rounded-full" />
      </div>

      {/* How It Works Section */}
      <section className="relative py-8 md:py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Simple Process
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Lets See
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              How It Works
              </span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Get started in three simple steps and transform your B2B procurement process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {[
              {
                step: '01',
                title: 'Browse & Discover',
                description:
                  'Explore thousands of products across multiple categories from verified vendors worldwide',
                icon: ShoppingBag,
              },
              {
                step: '02',
                title: 'Connect & Negotiate',
                description:
                  'Connect directly with vendors, negotiate pricing, and discuss bulk order requirements',
                icon: Users,
              },
              {
                step: '03',
                title: 'Order & Fulfill',
                description:
                  'Place orders, track shipments, and manage your entire procurement workflow seamlessly',
                icon: CheckCircle2,
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative group text-center"
                >
                  <div className="relative bg-surface/80 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div
                      className="absolute inset-0 bg-secondary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-6 group-hover:scale-110 transition-transform border-2 border-secondary/20 group-hover:border-secondary/40">
                        <Icon className="w-10 h-10 text-primary" />
                      </div>
                      <div className="text-6xl font-bold text-foreground/5 mb-4 absolute top-4 right-4">
                        {step.step}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-foreground/70 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-[calc(100%+1.5rem)] -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-12 h-12 rounded-full bg-surface border-2 border-secondary/30 flex items-center justify-center shadow-lg group-hover:border-secondary/50 group-hover:bg-secondary/5 transition-all">
                        <ArrowRight className="w-6 h-6 text-secondary" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Become Vendor Section */}
      <BecomeVendorSection />

      {/* Professional Divider */}
      <div className="relative w-full h-px bg-gradient-to-r from-transparent via-border to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-primary rounded-full" />
      </div>

      {/* CTA Section */}
      <section className="relative py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop&q=80"
            alt="Call to action"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-primary/90" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              Ready to Get Started?
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Transform Your Bazaarwale Today
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to streamline procurement,
            connect with vendors, and grow their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              Explore Marketplace
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/register/vendor"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              Become a Vendor
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
