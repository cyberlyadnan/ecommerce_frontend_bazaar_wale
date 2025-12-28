'use client';

const FAVORITES_STORAGE_KEY = 'b2b_favorites';

/**
 * Get all favorite product IDs from localStorage
 */
export const getFavoriteIds = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read favorites from localStorage', error);
    return [];
  }
};

/**
 * Add a product ID to favorites
 */
export const addToFavorites = (productId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const favorites = getFavoriteIds();
    if (!favorites.includes(productId)) {
      favorites.push(productId);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Failed to add favorite to localStorage', error);
  }
};

/**
 * Remove a product ID from favorites
 */
export const removeFromFavorites = (productId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const favorites = getFavoriteIds();
    const filtered = favorites.filter((id) => id !== productId);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove favorite from localStorage', error);
  }
};

/**
 * Check if a product is in favorites
 */
export const isFavorite = (productId: string): boolean => {
  const favorites = getFavoriteIds();
  return favorites.includes(productId);
};

/**
 * Toggle favorite status for a product
 */
export const toggleFavorite = (productId: string): boolean => {
  const newState = isFavorite(productId) ? false : true;
  
  if (isFavorite(productId)) {
    removeFromFavorites(productId);
  } else {
    addToFavorites(productId);
  }

  // Dispatch custom event to notify other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('favorites-changed'));
  }

  return newState;
};

