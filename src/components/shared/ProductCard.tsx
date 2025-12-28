'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Package, Star, StarHalf, Minus, Plus } from 'lucide-react';
import type { ProductDto } from '@/services/catalogApi';
import { formatCurrency } from '@/utils/currency';
import { FavoriteButton } from './FavoriteButton';
import { useAppSelector } from '@/store/redux/store';
import { addToCartApi } from '@/services/cartApi';
import { setCartItems } from '@/store/redux/slices/cartSlice';
import { useAppDispatch } from '@/store/redux/store';
import { ApiClientError } from '@/lib/apiClient';

interface ProductCardProps {
  product: ProductDto;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(product.minOrderQty || 1);
  const [isAdding, setIsAdding] = useState(false);

  // Calculate discount percentage
  const basePrice = product.price;
  const tierPrice = product.pricingTiers?.[0]?.pricePerUnit;
  const currentPrice = tierPrice || basePrice;
  const discountPercentage = tierPrice && tierPrice < basePrice
    ? Math.round(((basePrice - tierPrice) / basePrice) * 100)
    : null;

  // Get rating from product meta
  const averageRating = typeof product.meta?.averageRating === 'number'
    ? product.meta.averageRating as number
    : 0;
  const totalReviews = typeof product.meta?.totalReviews === 'number'
    ? product.meta.totalReviews as number
    : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf key={i} className="w-3 h-3 fill-secondary text-secondary" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-foreground/20" />
        );
      }
    }
    return stars;
  };

  const handleAddToCart = async () => {
    // If user is not logged in, redirect to login page with return URL
    if (!accessToken || !user) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
      return;
    }

    if (isAdding) return;

    setIsAdding(true);
    try {
      const response = await addToCartApi(
        {
          productId: product._id,
          qty: quantity,
        },
        accessToken,
      );

      if (response.items) {
        dispatch(setCartItems(response.items));
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= (product.minOrderQty || 1) && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <article className="group relative bg-surface border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30">
      {/* Image Container */}
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/40 to-muted/20">
            <Image
              src={product.images?.[0]?.url || FALLBACK_IMAGE}
              alt={product.images?.[0]?.alt || product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 28vw, 32vw"
              priority={false}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
          </div>
        </Link>

        {/* Discount Badge - Top Left */}
        {discountPercentage && (
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2.5 py-1 text-xs font-bold bg-secondary text-white rounded-md shadow-lg">
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* Favorite Button - Top Right */}
        <div className="absolute top-3 right-3 z-20">
          <FavoriteButton productId={product._id} />
        </div>

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="px-4 py-2 text-sm font-bold bg-danger text-white rounded-lg shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-1">
        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-base font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug mb-1">
            {product.title}
          </h3>
        </Link>

        {/* Rating - Below Title */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {renderStars(averageRating)}
            </div>
            <span className="text-xs font-medium text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-foreground/60">
              ({totalReviews})
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              {formatCurrency(currentPrice)}
            </span>
            {tierPrice && tierPrice < basePrice && (
              <span className="text-sm text-foreground/50 line-through">
                {formatCurrency(basePrice)}
              </span>
            )}
          </div>
          {tierPrice && tierPrice < basePrice && (
            <p className="text-xs text-foreground/60">
              Base price: {formatCurrency(basePrice)}
            </p>
          )}
        </div>

        {/* MOQ */}
        {product.minOrderQty && product.minOrderQty > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-foreground/70 bg-primary/5 px-2 py-1 rounded-md">
            <Package className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">MOQ: {product.minOrderQty} units</span>
          </div>
        )}

        {/* Quantity Selector & Add to Cart - Same Row */}
        {product.stock > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            {/* Quantity Selector */}
            <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= (product.minOrderQty || 1) || isAdding}
                className="px-2.5 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-sm font-semibold min-w-[3rem] text-center border-x border-border bg-surface">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock || isAdding}
                className="px-2.5 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.isActive || product.stock === 0 || isAdding}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isAdding ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  {/* <ShoppingCart className="w-4 h-4" /> */}
                  <span className="hidden sm:inline">Add to Cart</span>
                  <span className="sm:hidden">Add</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Out of Stock Button */}
        {product.stock === 0 && (
          <button
            disabled
            className="w-full px-4 py-2.5 bg-muted text-foreground/50 text-sm font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Out of Stock</span>
          </button>
        )}
      </div>
    </article>
  );
}
