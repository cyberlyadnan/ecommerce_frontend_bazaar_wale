import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CategoryDto, CategoryTreeNode } from '@/services/catalogApi';
import { CategoriesClient } from './CategoriesClient';

export const metadata: Metadata = {
  title: 'Shop by Category | Ecommerce B2B',
  description: 'Browse our wide range of product categories. Find everything your business needs in one place.',
};

export const dynamic = 'force-dynamic';

// Server-side fetch function
async function fetchCategoriesServer(): Promise<{
  categories: CategoryDto[];
  tree: CategoryTreeNode[];
}> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const url = `${apiBaseUrl}/api/catalog/categories`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
}

export default async function CategoriesPage() {
  let categories: CategoryDto[] = [];
  let tree: CategoryTreeNode[] = [];
  let error = '';

  try {
    const response = await fetchCategoriesServer();
    categories = response.categories;
    tree = response.tree;
  } catch (err) {
    console.error('Failed to fetch categories', err);
    error = 'Unable to load categories right now.';
  }

  const topLevelCategories = categories.filter((cat) => !cat.parent && cat.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-surface/30">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10" />
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
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Shop by Category
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Discover Our
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Product Categories
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Explore thousands of products organized by category. Find exactly what your business
              needs with our comprehensive catalog.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      {error ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Unable to Load Categories</h2>
            <p className="text-foreground/70">{error}</p>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <CategoriesClient
            categories={categories}
            tree={tree}
            topLevelCategories={topLevelCategories}
          />
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Can't Find What You Need?
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Let Us Help You Find It
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
            Our team is ready to assist you in finding the perfect products for your business needs.
            Contact us today!
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Contact Us
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
