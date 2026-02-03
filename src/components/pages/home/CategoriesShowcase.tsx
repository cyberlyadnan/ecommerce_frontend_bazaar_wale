'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent: string | null;
  isActive: boolean;
}

interface CategoriesShowcaseProps {
  categories: Category[];
}

// Category images mapping - using Unsplash images
const categoryImages: Record<string, string> = {
  'industrial-equipment': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&q=80',
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop&q=80',
  'machinery': 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop&q=80',
  'raw-materials': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop&q=80',
  'tools': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80',
  'components': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
};

const getCategoryImage = (slug: string, image?: string): string => {
  return image || categoryImages[slug] || categoryImages.default;
};

export function CategoriesShowcase({ categories }: CategoriesShowcaseProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-surface">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Shop by Category
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Explore Our
            <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
              Product Categories
            </span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Browse through our comprehensive catalog organized by category. Find exactly what your
            business needs.
          </p>
        </div>

        {/* Categories Grid - Portrait Image Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category, index) => {
            const categoryImage = getCategoryImage(category.slug, category.image);

            return (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group relative bg-surface overflow-hidden border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Image - Reduced Height */}
                <div className="relative w-full h-72 rounded-sm overflow-hidden bg-surface/50">
                  <Image
                    src={categoryImage}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  {/* Primary color overlay on hover */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Category Name Below - Modern Style */}
                <div className="relative px-4 py-2 bg-surface border-t border-border/20">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors text-center uppercase tracking-wide">
                    {category.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

