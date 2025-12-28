import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ProductDto } from '@/services/catalogApi';
import ProductCard from '@/components/shared/ProductCard';

interface ProductShowcaseProps {
  products: ProductDto[];
  title?: string;
  description?: string;
  viewAllHref?: string;
}

export default function ProductShowcase({
  products,
  title = 'Featured Products',
  description = 'Hand-picked listings from verified vendors tailored for B2B buyers.',
  viewAllHref = '/products',
}: ProductShowcaseProps) {
  console.log('products', products);
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" />
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
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Featured Collection
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {title}
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto mb-8">{description}</p>
        </header>

        {/* Product Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* View All Button (Bottom) */}
        <div className="mt-12 text-center">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface/80 backdrop-blur-xl border-2 border-primary/20 hover:border-primary text-primary rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <span>View All Products</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}