'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

import { AddToCartButton } from '@/components/shared/AddToCartButton';
import { FavoriteButton } from '@/components/shared/FavoriteButton';

interface ProductActionsProps {
  productId: string;
  minOrderQty: number;
  stock: number;
  isActive: boolean;
  showTopActions?: boolean; // If true, only show favorite/share buttons
}

export function ProductActions({ 
  productId, 
  minOrderQty, 
  stock, 
  isActive,
  showTopActions = false 
}: ProductActionsProps) {
  const [shareMessage, setShareMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title;

    try {
      // Try Web Share API first (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });
        setShareMessage({ type: 'success', text: 'Product shared successfully!' });
        setTimeout(() => setShareMessage(null), 3000);
        return;
      }

      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      setShareMessage({ type: 'success', text: 'Product link copied to clipboard!' });
      setTimeout(() => setShareMessage(null), 3000);
    } catch (error) {
      // User cancelled share or clipboard failed
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to share:', error);
        setShareMessage({ type: 'error', text: 'Failed to share. Please try again.' });
        setTimeout(() => setShareMessage(null), 3000);
      }
    }
  };

  // If showTopActions is true, only render favorite/share buttons (for header)
  if (showTopActions) {
    return (
      <div className="flex items-center gap-2 relative">
        <FavoriteButton productId={productId} />
        <button
          onClick={handleShare}
          className="p-2 rounded-lg border border-border hover:bg-surface transition"
          aria-label="Share product"
        >
          <Share2 className="w-5 h-5" />
        </button>
        {shareMessage && (
          <div
            className={`absolute top-full right-0 mt-2 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-lg ${
              shareMessage.type === 'success'
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-danger/10 text-danger border border-danger/20'
            }`}
          >
            {shareMessage.text}
          </div>
        )}
      </div>
    );
  }

  // Full actions (add to cart + favorite/share)
  return (
    <div className="space-y-4">
      {/* Add to Cart Button */}
      <div>
        <AddToCartButton
          productId={productId}
          minOrderQty={minOrderQty}
          stock={stock}
          isActive={isActive}
          className="w-full"
        />
      </div>
    </div>
  );
}

