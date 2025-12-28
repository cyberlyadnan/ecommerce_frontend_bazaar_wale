'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { ApiClientError } from '@/lib/apiClient';
import { CategoryDto, CategoryTreeNode, fetchCategories, ProductDto } from '@/services/catalogApi';
import ProductEditor from '@/components/admin/products/ProductEditor';
import { useAppSelector } from '@/store/redux/store';

export default function VendorCreateProductPage() {
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchCategories();
      setCategories(response.categories ?? []);
      setTree(response.tree ?? []);
    } catch (err) {
      console.error('Failed to load categories', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Unable to load categories right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSuccess = (product: ProductDto) => {
    setTimeout(() => {
      router.push(`/vendor/products/${product._id}/edit`);
    }, 750);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing product form…
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

  if (!accessToken) {
    return (
      <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-600">
        Session required. Please sign in again to create products.
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Create New Product</h1>
        <p className="text-xs md:text-sm text-muted">
          Add a new product listing to your catalogue. Products will be reviewed by admin before going live.
        </p>
      </header>

      <ProductEditor
        mode="create"
        categories={categories}
        accessToken={accessToken}
        onSuccess={handleSuccess}
        isVendor={true}
      />

      {tree.length > 0 && (
        <section className="rounded-xl md:rounded-2xl border border-border bg-surface p-4 md:p-6 shadow-sm space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-foreground">Category Overview</h2>
          <p className="text-xs md:text-sm text-muted">
            You can assign the product to any category or subcategory shown here.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {tree.map((node) => (
              <div
                key={node._id}
                className="rounded-xl border border-border/80 bg-background/60 p-3 md:p-4"
              >
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

