'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { ApiClientError } from '@/lib/apiClient';
import { deleteProductApi, fetchProductById, ProductDto } from '@/services/catalogApi';
import { useAppSelector } from '@/store/redux/store';
import { formatCurrency } from '@/utils/currency';

export default function VendorProductViewPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const currentUser = useAppSelector((state) => state.auth.user);
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!params?.productId) {
        setError('Missing product identifier.');
        setLoading(false);
        return;
      }

      if (!accessToken) {
        setError('Session expired. Please sign in again.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetchProductById(params.productId, accessToken);

        // Verify that the product belongs to the current vendor
        if (response.product) {
          const productVendorId =
            typeof response.product.vendor === 'string'
              ? response.product.vendor
              : response.product.vendor?._id;
          const currentUserId = currentUser?.id;

          if (productVendorId !== currentUserId) {
            setError('You do not have permission to view this product.');
            setProduct(null);
          } else {
            setProduct(response.product);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to load product', err);
        const message =
          err instanceof ApiClientError ? err.message : 'Unable to load product right now.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.productId, accessToken, currentUser]);

  const handleDelete = async () => {
    if (!product) return;

    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    if (!accessToken) {
      setError('Session expired. Please sign in again.');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await deleteProductApi(product._id, accessToken);
      router.push('/vendor/products');
    } catch (err) {
      console.error('Failed to delete product', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to delete product. Please try again.';
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

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

  if (error && !product) {
    return (
      <div className="space-y-4">
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-600">
          Product not found. It may have been removed.
        </div>
      </div>
    );
  }

  const primaryImage = product.images?.[0]?.url;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground w-fit"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/vendor/products/${product._id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
          >
            <Edit size={16} />
            Edit Product
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-surface px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            {primaryImage ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted/20">
                <Image
                  src={primaryImage}
                  alt={product.images?.[0]?.alt || product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="aspect-square w-full rounded-lg bg-muted/20 flex items-center justify-center">
                <span className="text-muted">No image</span>
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-muted/20"
                >
                  {image.url && (
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.title} ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 md:p-6 shadow-sm space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.title}</h1>
              {product.sku && (
                <p className="text-sm text-muted mt-1">SKU: {product.sku}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  product.isActive
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-muted/20 text-muted'
                }`}
              >
                {product.isActive ? 'Public (Live)' : 'Draft'}
              </span>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</p>
            </div>

            {product.shortDescription && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Short Description</h3>
                <p className="text-sm text-muted">{product.shortDescription}</p>
              </div>
            )}

            {product.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted mb-1">Stock</p>
                <p className="text-sm font-semibold text-foreground">{product.stock || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Min Order Qty</p>
                <p className="text-sm font-semibold text-foreground">
                  {product.minOrderQty || 1}
                </p>
              </div>
              {product.weightKg && (
                <div>
                  <p className="text-xs text-muted mb-1">Weight</p>
                  <p className="text-sm font-semibold text-foreground">{product.weightKg} kg</p>
                </div>
              )}
              {product.category && (
                <div>
                  <p className="text-xs text-muted mb-1">Category</p>
                  <p className="text-sm font-semibold text-foreground">
                    {product.category.name}
                    {product.subcategory ? ` / ${product.subcategory.name}` : ''}
                  </p>
                </div>
              )}
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-muted/20 px-3 py-1 text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-2">Attributes</h3>
                <dl className="space-y-2">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-xs text-muted">{key}:</dt>
                      <dd className="text-xs text-foreground font-medium">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

