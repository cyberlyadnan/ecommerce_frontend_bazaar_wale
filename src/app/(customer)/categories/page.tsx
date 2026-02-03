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
import { getCategories } from '@/services/serverCategories';

export const metadata: Metadata = {
  title: 'Shop by Category',
  description: 'Browse our wide range of B2B product categories. Find everything your business needs - electronics, machinery, raw materials & more.',
  openGraph: {
    title: 'Shop by Category | Bazaarwale',
    description: 'Browse our wide range of B2B product categories. Find everything your business needs.',
    url: '/categories',
  },
};

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  let categories: CategoryDto[] = [];
  let tree: CategoryTreeNode[] = [];
  let error = '';

  try {
    const response = await getCategories();
    categories = response.categories;
    tree = response.tree;
    
    // Debug logging
    console.log('[CategoriesPage] Received data:', {
      categoriesCount: categories.length,
      treeCount: tree.length,
      sampleCategory: categories[0],
      activeCategories: categories.filter(cat => cat.isActive).length,
      topLevelCategories: categories.filter(cat => !cat.parent).length,
    });
  } catch (err) {
    console.error('Failed to fetch categories', err);
    error = 'Unable to load categories right now.';
  }

  const topLevelCategories = categories.filter((cat) => !cat.parent && cat.isActive);
  
  console.log('[CategoriesPage] Filtered topLevelCategories:', topLevelCategories.length);

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
            <p className="text-sm text-foreground/50 mt-2">
              Please check that the backend server is running and the API endpoint is accessible.
            </p>
          </div>
        </section>
      ) : topLevelCategories.length === 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">No Categories Available</h2>
            <p className="text-foreground/70">
              {categories.length === 0
                ? 'No categories found. Please check the backend database.'
                : `Found ${categories.length} category/categories, but none are active top-level categories.`}
            </p>
            {categories.length > 0 && (
              <p className="text-sm text-foreground/50 mt-2">
                Active categories: {categories.filter(c => c.isActive).length} | 
                Top-level categories: {categories.filter(c => !c.parent).length}
              </p>
            )}
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
