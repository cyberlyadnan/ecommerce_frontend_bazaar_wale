import "server-only";

import { cache } from "react";
import type { CategoryDto, CategoryTreeNode } from "./catalogApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

interface FetchOptions extends RequestInit {
  next?: { revalidate?: number };
}

async function fetchJson<T>(url: string, init?: FetchOptions): Promise<T> {
  const requestInit: FetchOptions = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    next: init?.next ?? { revalidate: 60 },
  };

  const response = await fetch(url, requestInit);

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      (payload && (payload as { message?: string }).message) ||
      response.statusText ||
      "Request failed";
    throw new Error(message);
  }

  return response.json();
}

export const getCategories = cache(
  async (): Promise<{ categories: CategoryDto[]; tree: CategoryTreeNode[] }> => {
    const url = `${API_BASE_URL}/api/catalog/categories`;
    
    console.log('[getCategories] Attempting to fetch from:', url);
    console.log('[getCategories] API_BASE_URL:', API_BASE_URL);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 },
      });

      console.log('[getCategories] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        console.error('[getCategories] API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Debug logging to help diagnose issues
      console.log('[getCategories] API Response received:', {
        url,
        responseType: typeof data,
        isArray: Array.isArray(data),
        hasCategories: !!data?.categories,
        categoriesCount: data?.categories?.length ?? 0,
        hasTree: !!data?.tree,
        treeCount: data?.tree?.length ?? 0,
        dataKeys: data ? Object.keys(data) : [],
        sampleData: data ? JSON.stringify(data).substring(0, 200) : 'null',
      });
      
      // Handle response - backend returns { categories: [...], tree: [...] }
      let categories: CategoryDto[] = [];
      let tree: CategoryTreeNode[] = [];
      
      if (data) {
        if (data.categories && Array.isArray(data.categories)) {
          categories = data.categories;
        } else if (Array.isArray(data)) {
          // Fallback: if response is directly an array, treat as categories
          categories = data;
        }
        
        if (data.tree && Array.isArray(data.tree)) {
          tree = data.tree;
        }
      }
      
      console.log('[getCategories] Processed data:', {
        categoriesCount: categories.length,
        treeCount: tree.length,
        activeCategories: categories.filter(c => c.isActive).length,
        topLevelCategories: categories.filter(c => !c.parent).length,
      });
      
      return {
        categories,
        tree,
      };
    } catch (error) {
      console.error("[getCategories] Failed to fetch categories:", error);
      console.error("[getCategories] Error details:", {
        url,
        apiBaseUrl: API_BASE_URL,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
        } : String(error),
      });
      // Return empty arrays instead of throwing to prevent page crashes
      return { categories: [], tree: [] };
    }
  }
);

