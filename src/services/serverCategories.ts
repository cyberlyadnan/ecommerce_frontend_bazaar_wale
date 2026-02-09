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
    const url = `${API_BASE_URL}/api/catalog/categories?activeOnly=true`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        console.error('[getCategories] API error:', response.status, errorText);
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let categories: CategoryDto[] = [];
      let tree: CategoryTreeNode[] = [];

      if (data) {
        if (data.categories && Array.isArray(data.categories)) {
          categories = data.categories;
        } else if (Array.isArray(data)) {
          categories = data;
        }
        if (data.tree && Array.isArray(data.tree)) {
          tree = data.tree;
        }
      }

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

