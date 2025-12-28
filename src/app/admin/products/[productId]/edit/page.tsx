'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { ApiClientError } from '@/lib/apiClient';
import {
  CategoryDto,
  CategoryTreeNode,
  fetchCategories,
  fetchProductById,
  ProductDto,
} from '@/services/catalogApi';
import ProductEditor from '@/components/admin/products/ProductEditor';
import { useAppSelector } from '@/store/redux/store';

export default function AdminEditProductPage() {
  const params = useParams<{ productId: string }>();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!params?.productId) {
      setError('Missing product identifier.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [categoryResponse, productResponse] = await Promise.all([
        fetchCategories(),
        fetchProductById(params.productId, accessToken ?? undefined),
      ]);
      setCategories(categoryResponse.categories);
      setTree(categoryResponse.tree);
      setProduct(productResponse.product);
    } catch (err) {
      console.error('Failed to load product', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Unable to load product right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      setError('Admin session expired. Please sign in again.');
      setLoading(false);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.productId, accessToken]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading product details…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-600">
        Product not found. It may have been removed.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Edit product</h1>
        <p className="text-sm text-muted">
          Update catalogue and compliance metadata. Changes are live immediately after saving.
        </p>
      </header>

      {accessToken && (
        <ProductEditor
          mode="edit"
          categories={categories}
          product={product}
          accessToken={accessToken}
          onSuccess={setProduct}
        />
      )}

      {tree.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Category context</h2>
          <p className="text-sm text-muted">
            Reference the existing taxonomy to ensure grouping remains accurate.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {tree.map((node) => (
              <div key={node._id} className="rounded-xl border border-border/80 bg-background/60 p-4">
                <p className="text-sm font-semibold text-foreground">{node.name}</p>
                {node.children.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-muted">
                    {node.children.map((child) => (
                      <li key={child._id}>• {child.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


