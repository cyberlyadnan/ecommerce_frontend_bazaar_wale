'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, X, SlidersHorizontal, Grid3x3, List, ChevronDown, Star, StarHalf, Package } from 'lucide-react';
import { fetchPublicProducts, type ProductDto } from '@/services/catalogApi';
import ProductCard from '@/components/shared/ProductCard';
import { AddToCartButton } from '@/components/shared/AddToCartButton';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { formatCurrency } from '@/utils/currency';
import { Loader2 } from 'lucide-react';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating' | 'name';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    
    const newUrl = params.toString() 
      ? `/products?${params.toString()}` 
      : '/products';
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, selectedCategory, sortBy, router]);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchPublicProducts({
          search: debouncedSearch || undefined,
          limit: 100, // Load more products for filtering
        });
        setProducts(response.products || []);
      } catch (err: any) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [debouncedSearch]);

  // Calculate price range from products
  const priceRangeData = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => {
      const tierPrice = p.pricingTiers?.[0]?.pricePerUnit;
      return tierPrice || p.price;
    });
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          product.category?.slug === selectedCategory ||
          product.subcategory?.slug === selectedCategory
      );
    }

    // Filter by price range
    if (priceRange) {
      filtered = filtered.filter((product) => {
        const tierPrice = product.pricingTiers?.[0]?.pricePerUnit;
        const currentPrice = tierPrice || product.price;
        return currentPrice >= priceRange[0] && currentPrice <= priceRange[1];
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          const priceA = a.pricingTiers?.[0]?.pricePerUnit || a.price;
          const priceB = b.pricingTiers?.[0]?.pricePerUnit || b.price;
          return priceA - priceB;
        case 'price-high':
          const priceAHigh = a.pricingTiers?.[0]?.pricePerUnit || a.price;
          const priceBHigh = b.pricingTiers?.[0]?.pricePerUnit || b.price;
          return priceBHigh - priceAHigh;
        case 'rating':
          const ratingA = (a.meta?.averageRating as number) || 0;
          const ratingB = (b.meta?.averageRating as number) || 0;
          return ratingB - ratingA;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [products, selectedCategory, priceRange, sortBy]);

  // Extract unique categories
  const categories = useMemo(() => {
    const categoryMap = new Map<string, { name: string; slug: string; count: number }>();
    products.forEach((product) => {
      if (product.category) {
        const slug = product.category.slug;
        const existing = categoryMap.get(slug);
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(slug, {
            name: product.category.name,
            slug,
            count: 1,
          });
        }
      }
    });
    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setPriceRange(null);
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || selectedCategory || priceRange || sortBy !== 'newest';

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            {/* <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">All Products</h1>
              <p className="text-foreground/60">
                Discover our complete catalog of B2B products
              </p>
            </div> */}

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                    showFilters || hasActiveFilters
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-surface border-border hover:bg-muted'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                  {hasActiveFilters && (
                    <span className="px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs">
                      {[searchTerm, selectedCategory, sortBy !== 'newest' && 'sorted'].filter(Boolean).length}
                    </span>
                  )}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none pl-4 pr-10 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition ${
                      viewMode === 'grid'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition ${
                      viewMode === 'list'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 flex-shrink-0`}
          >
            <div className="bg-surface rounded-xl p-6 border border-border sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1 hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories Filter */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      !selectedCategory
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground/70'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category.slug ? null : category.slug
                        )
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                        selectedCategory === category.slug
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground/70'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs opacity-70">({category.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              {priceRangeData.max > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={`Min (${formatCurrency(priceRangeData.min)})`}
                        value={priceRange?.[0] || ''}
                        onChange={(e) => {
                          const min = e.target.value ? Number(e.target.value) : priceRangeData.min;
                          setPriceRange([
                            min,
                            priceRange?.[1] || priceRangeData.max,
                          ]);
                        }}
                        min={priceRangeData.min}
                        max={priceRangeData.max}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-foreground/60">to</span>
                      <input
                        type="number"
                        placeholder={`Max (${formatCurrency(priceRangeData.max)})`}
                        value={priceRange?.[1] || ''}
                        onChange={(e) => {
                          const max = e.target.value ? Number(e.target.value) : priceRangeData.max;
                          setPriceRange([
                            priceRange?.[0] || priceRangeData.min,
                            max,
                          ]);
                        }}
                        min={priceRangeData.min}
                        max={priceRangeData.max}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    {priceRange && (
                      <button
                        onClick={() => setPriceRange(null)}
                        className="w-full px-3 py-1.5 text-xs text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition"
                      >
                        Clear Price Filter
                      </button>
                    )}
                    <div className="text-xs text-foreground/60">
                      Range: {formatCurrency(priceRangeData.min)} - {formatCurrency(priceRangeData.max)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Products Grid/List */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-foreground/60">Loading products...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-foreground/60">{error}</p>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Search className="w-8 h-8 text-foreground/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No products found</h3>
                    <p className="text-foreground/60">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-sm text-foreground/60">
                    Showing <span className="font-semibold text-foreground">
                      {filteredAndSortedProducts.length}
                    </span>{' '}
                    {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </div>

                {/* Products Grid */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedProducts.map((product) => {
                      const averageRating = typeof product.meta?.averageRating === 'number'
                        ? product.meta.averageRating as number
                        : 0;
                      const totalReviews = typeof product.meta?.totalReviews === 'number'
                        ? product.meta.totalReviews as number
                        : 0;
                      const tierPrice = product.pricingTiers?.[0]?.pricePerUnit;
                      const currentPrice = tierPrice || product.price;
                      const discountPercentage = tierPrice && tierPrice < product.price
                        ? Math.round(((product.price - tierPrice) / product.price) * 100)
                        : null;

                      const renderStars = (rating: number) => {
                        const stars = [];
                        const fullStars = Math.floor(rating);
                        const hasHalfStar = rating % 1 >= 0.5;
                        for (let i = 1; i <= 5; i++) {
                          if (i <= fullStars) {
                            stars.push(
                              <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                            );
                          } else if (i === fullStars + 1 && hasHalfStar) {
                            stars.push(
                              <StarHalf key={i} className="w-4 h-4 fill-secondary text-secondary" />
                            );
                          } else {
                            stars.push(
                              <Star key={i} className="w-4 h-4 text-foreground/20" />
                            );
                          }
                        }
                        return stars;
                      };

                      return (
                        <div
                          key={product._id}
                          className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary/50"
                        >
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Product Image */}
                            <Link href={`/products/${product.slug}`} className="flex-shrink-0">
                              <div className="relative w-full lg:w-48 h-64 lg:h-48 rounded-lg overflow-hidden bg-muted/30 group">
                                {product.images?.[0]?.url ? (
                                  <Image
                                    src={product.images[0].url}
                                    alt={product.images[0].alt || product.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-foreground/40">
                                    No Image
                                  </div>
                                )}
                                {discountPercentage && (
                                  <div className="absolute top-2 left-2">
                                    <span className="px-2 py-1 text-xs font-bold bg-secondary text-white rounded-md">
                                      -{discountPercentage}%
                                    </span>
                                  </div>
                                )}
                                <div className="absolute top-2 right-2">
                                  <FavoriteButton productId={product._id} />
                                </div>
                              </div>
                            </Link>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0 space-y-4">
                              <div>
                                <Link href={`/products/${product.slug}`}>
                                  <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
                                    {product.title}
                                  </h3>
                                </Link>
                                {product.shortDescription && (
                                  <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
                                    {product.shortDescription}
                                  </p>
                                )}

                                {/* Rating */}
                                {totalReviews > 0 && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-0.5">
                                      {renderStars(averageRating)}
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                      {averageRating.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-foreground/60">
                                      ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Price and Actions */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
                                <div className="space-y-1">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-primary">
                                      {formatCurrency(currentPrice)}
                                    </span>
                                    {tierPrice && tierPrice < product.price && (
                                      <span className="text-sm text-foreground/60 line-through">
                                        {formatCurrency(product.price)}
                                      </span>
                                    )}
                                  </div>
                                  {product.minOrderQty && product.minOrderQty > 1 && (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full text-xs text-primary font-medium">
                                      <Package className="w-3 h-3" />
                                      <span>MOQ: {product.minOrderQty} units</span>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full sm:w-auto">
                                  <AddToCartButton
                                    productId={product._id}
                                    minOrderQty={product.minOrderQty || 1}
                                    stock={product.stock || 0}
                                    isActive={product.isActive}
                                    className="w-full sm:w-auto sm:min-w-[200px]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
