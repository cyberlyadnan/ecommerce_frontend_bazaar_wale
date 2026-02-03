import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Building2,
  Users,
  Target,
  Award,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Bazaarwale - your trusted B2B wholesale partner. Our mission is to connect businesses with quality products and exceptional service.',
  openGraph: {
    title: 'About Us | Bazaarwale',
    description: 'Learn about Bazaarwale - your trusted B2B wholesale partner.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop&q=80"
            alt="Business team collaboration"
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
                About Our Platform
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Empowering Bazaarwale
              <span className="block bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                Through Innovation
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
              Connecting businesses worldwide with a trusted, efficient marketplace that transforms
              how suppliers and buyers collaborate.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section with Image */}
      <section className="relative py-16 md:py-24 overflow-hidden">
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
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                <Image
                  src="https://thumbs.dreamstime.com/b/business-strategy-collaboration-b-e-commerce-emphasis-sales-techniques-agreements-supplier-relationships-visual-405351584.jpg"
                  alt="Business mission"
                  width={600}
                  height={400}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Our Mission
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Revolutionizing Bazaarwale
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed">
                To revolutionize Bazaarwale by providing a platform that makes wholesale
                purchasing simple, transparent, and efficient for businesses of all sizes.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                We believe in building lasting relationships between suppliers and buyers, fostering
                trust through verified vendors and quality assurance.
              </p>

              {/* Features List */}
              <div className="space-y-4 pt-4">
                {[
                  'Connect verified suppliers with businesses',
                  'Streamline bulk purchasing processes',
                  'Ensure quality and compliance standards',
                  'Provide transparent pricing and terms',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground/80 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section with Images */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-surface via-background to-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Core Values
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              What Drives Us
            </h2>
            <p className="text-lg text-foreground/70">
              The principles that guide everything we do and every decision we make.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Shield,
                title: 'Trust & Security',
                description:
                  'Verified vendors and secure transactions ensure peace of mind for every business partnership.',
                image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&q=80',
                gradient: 'from-blue-500/20 to-blue-600/20',
              },
              {
                icon: Users,
                title: 'Customer First',
                description:
                  'Your success is our priority. We\'re committed to providing exceptional support and service.',
                image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&q=80',
                gradient: 'from-emerald-500/20 to-emerald-600/20',
              },
              {
                icon: Award,
                title: 'Quality Assurance',
                description:
                  'Rigorous quality checks and compliance standards for all products and suppliers.',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop&q=80',
                gradient: 'from-amber-500/20 to-amber-600/20',
              },
              {
                icon: Globe,
                title: 'Innovation',
                description:
                  'Continuously improving our platform with cutting-edge technology and features.',
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&q=80',
                gradient: 'from-purple-500/20 to-purple-600/20',
              },
              {
                icon: Building2,
                title: 'Partnership',
                description:
                  'Building long-term relationships that benefit both suppliers and buyers.',
                image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&q=80',
                gradient: 'from-indigo-500/20 to-indigo-600/20',
              },
              {
                icon: Zap,
                title: 'Efficiency',
                description:
                  'Streamlined processes that save time and reduce costs for all parties.',
                image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop&q=80',
                gradient: 'from-cyan-500/20 to-cyan-600/20',
              },
            ].map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-surface rounded-2xl overflow-hidden border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                    <Image
                      src={value.image}
                      alt={value.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Content */}
                  <div className="relative p-6 md:p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors duration-300">
                      <IconComponent className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                    <p className="text-foreground/70 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section with Visual Elements */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                By The Numbers
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-foreground/70">
              Join a growing community of businesses transforming their procurement processes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '20+', label: 'Verified Suppliers', icon: Shield },
              { value: '50+', label: 'Active Products', icon: Award },
              { value: '100+', label: 'Business Customers', icon: Users },
              { value: '99.9%', label: 'Satisfaction Rate', icon: TrendingUp },
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="relative group bg-surface/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 group-hover:bg-primary/20 mb-4 transition-colors duration-300">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-foreground/70 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision Section with Image */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Our Vision
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Shaping the Future of Bazaarwale
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed">
                We envision a world where businesses can seamlessly connect, transact, and grow
                together through intelligent technology and trusted partnerships.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                Our platform is designed to scale with your business, providing the tools and
                insights you need to make informed decisions and drive success.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Global Reach</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                <Image
                  src="https://t4.ftcdn.net/jpg/06/04/76/33/360_F_604763387_iHshS2pHBV3JA0L909nFnSIEazs2GUfV.jpg"
                  alt="Future vision"
                  width={600}
                  height={400}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop&q=80"
            alt="CTA background"
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
              Get Started Today
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform for their B2B needs. Start
            your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Sign Up as Buyer
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/register/vendor"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Become a Supplier
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
