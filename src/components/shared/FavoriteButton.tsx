// ========================================
// components/FavoriteButton.tsx
// ========================================

'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { isFavorite, toggleFavorite as toggleFavoriteStorage } from '@/utils/favorites';

interface FavoriteButtonProps {
  productId: string;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({ productId, onToggle }: FavoriteButtonProps) {
  const [isFavoriteState, setIsFavoriteState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize favorite state from localStorage
  useEffect(() => {
    setIsFavoriteState(isFavorite(productId));
  }, [productId]);

  // Listen for favorites-changed events from other components
  useEffect(() => {
    const handleFavoritesChanged = () => {
      setIsFavoriteState(isFavorite(productId));
    };

    window.addEventListener('favorites-changed', handleFavoritesChanged);
    return () => {
      window.removeEventListener('favorites-changed', handleFavoritesChanged);
    };
  }, [productId]);

  const handleToggleFavorite = () => {
    setIsLoading(true);
    
    try {
      const newFavoriteState = toggleFavoriteStorage(productId);
      setIsFavoriteState(newFavoriteState);
      onToggle?.(newFavoriteState);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isFavoriteState ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavoriteState ? (
        <Heart className="w-4 h-4 text-danger fill-current" />
      ) : (
        <Heart className="w-4 h-4 text-foreground/70 hover:text-danger transition-colors" />
      )}
    </button>
  );
}
