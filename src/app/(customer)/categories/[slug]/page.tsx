import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getCategories } from '@/services/serverCategories';
import { getPublicProductsByCategory } from '@/services/serverProducts';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';
import ProductCard from '@/components/shared/ProductCard';
import { ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCategories();
  const category = categories.find((c) => c.slug === slug && c.isActive);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const title = `${category.name} Products`;
  const description =
    category.description ||
    `Shop ${category.name} - B2B wholesale products at competitive prices. Browse our ${category.name} catalog.`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/categories/${slug}`),
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/categories/${slug}`),
    },
  };
}

export default async function CategoryProductsPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [{ categories }, { products, total }] = await Promise.all([
    getCategories(),
    getPublicProductsByCategory(slug, { limit: 100 }),
  ]);

  const category = categories.find((c) => c.slug === slug && c.isActive);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Back */}
        <div className="mb-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            All Categories
          </Link>
          <nav className="text-sm text-muted">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/categories" className="hover:text-primary">Categories</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {category.name}
            </h1>
            <p className="text-muted">
              {total} {total === 1 ? 'product' : 'products'} in this category
            </p>
          </div>
          {products.length > 0 && (
            <Link
              href={`/products?category=${slug}&filters=1`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors shrink-0"
            >
              Refine with filters
            </Link>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted mb-6">No products found in this category yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
