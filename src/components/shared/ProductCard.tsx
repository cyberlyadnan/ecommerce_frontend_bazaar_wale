'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Package, Star, StarHalf, Minus, Plus } from 'lucide-react';
import type { ProductDto } from '@/services/catalogApi';
import { formatCurrency, resolveProductImage } from '@/utils/currency';
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
    <article className="group relative bg-surface border border-border/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 flex flex-col h-full backdrop-blur-sm">
      {/* Image Container - Optimized aspect ratio */}
      <div className="relative flex-shrink-0">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
            <Image
              src={resolveProductImage(product.images?.[0]?.url) || FALLBACK_IMAGE}
              alt={product.images?.[0]?.alt || product.title}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>

        {/* Badges Container - Top */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-20 pointer-events-none">
          {/* Discount Badge */}
          {discountPercentage && (
            <span className="px-2 py-1 text-[10px] sm:text-xs font-bold bg-gradient-to-r from-secondary via-secondary to-secondary/90 text-white rounded-md shadow-lg backdrop-blur-sm pointer-events-auto">
              -{discountPercentage}%
            </span>
          )}
          <div className={discountPercentage ? '' : 'ml-auto'}>
            <div className="pointer-events-auto">
              <FavoriteButton productId={product._id} />
            </div>
          </div>
        </div>

        {/* Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-3 py-1.5 text-xs font-bold bg-danger/90 text-white rounded-lg shadow-lg backdrop-blur-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content - Compact and organized */}
      <div className="p-3 flex flex-col flex-grow space-y-2">
        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[2.5rem]">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {renderStars(averageRating)}
            </div>
            <span className="text-[11px] font-semibold text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-[11px] text-foreground/40">
              ({totalReviews})
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold text-primary">
            {formatCurrency(currentPrice)}
          </span>
          {tierPrice && tierPrice < basePrice && (
            <span className="text-xs text-foreground/40 line-through">
              {formatCurrency(basePrice)}
            </span>
          )}
        </div>

        {/* MOQ Badge */}
        {product.minOrderQty && product.minOrderQty > 1 && false && (
          <div className="flex items-center gap-1 text-[11px] text-foreground/60 bg-primary/5 px-2 py-1 rounded-md w-fit">
            <Package className="w-3 h-3 text-primary/70" />
            <span className="font-medium">MOQ: {product.minOrderQty}</span>
          </div>
        )}

        {/* Actions - Compact and responsive */}
        <div className="mt-auto pt-2">
          {product.stock > 0 ? (
            <div className="flex items-stretch gap-2">
              {/* Quantity Selector - Minimal */}
              <div className="flex items-center border border-border rounded-lg bg-background/50 overflow-hidden hover:border-primary/40 transition-colors">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= (product.minOrderQty || 1) || isAdding}
                  className="p-1.5 text-foreground/60 hover:text-foreground hover:bg-primary/5 active:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-bold min-w-[1.75rem] text-center text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock || isAdding}
                  className="p-1.5 text-foreground/60 hover:text-foreground hover:bg-primary/5 active:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button - Sleek */}
              <button
                onClick={handleAddToCart}
                disabled={!product.isActive || product.stock === 0 || isAdding}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-primary to-primary/95 hover:from-primary/95 hover:to-primary text-primary-foreground text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-[0.97]"
              >
                {isAdding ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">Add</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full px-3 py-2 bg-muted/40 text-foreground/40 text-xs font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Out of Stock</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}