import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Package,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  PackageX,
} from 'lucide-react';

import { getProductBySlug } from '@/services/serverProducts';
import { formatCurrency, resolveProductImage } from '@/utils/currency';
import Link from 'next/link';
import { ProductActions } from '@/components/pages/product/ProductActions';
import { ReviewSection } from '@/components/pages/product/ReviewSection';
import { ProductReviewStats } from '@/components/pages/product/ProductReviewStats';
import { RecordProductView } from '@/components/pages/product/RecordProductView';

interface ProductDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = params;

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return { title: 'Product not found' };
    }

    const title = `${product.title} | Ecommerce B2B`;
    const description =
      product.shortDescription || product.description || 'Discover B2B wholesale pricing';

    const ogImage = product.images?.[0]?.url;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ogImage ? [{ url: ogImage, alt: product.images?.[0]?.alt || product.title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch (error) {
    console.error('Failed to generate product metadata', error);
    return { title: 'Product details' };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  const productResult = await getProductBySlug(slug);
  console.log(productResult);

  if (!productResult) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background px-6 text-center">
        <div className="bg-surface border border-border rounded-2xl p-10 shadow-sm max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="bg-muted/30 rounded-full p-4 mb-6">
              <PackageX className="w-12 h-12 text-foreground/60" />
            </div>
  
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Product Not Found
            </h2>
            <p className="text-foreground/60 mb-6">
              We couldn’t find the product you’re looking for. It may have been removed or doesn’t exist.
            </p>
  
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const product = productResult;
  const [primaryImage, ...restImages] = product.images ?? [];
  const images = primaryImage ? [primaryImage, ...restImages] : [];

  const priceUnit =
    product.pricingTiers && product.pricingTiers.length > 0
      ? product.pricingTiers.sort((a, b) => a.minQty - b.minQty)[0]?.pricePerUnit ?? product.price
      : product.price;

  const formatMoney = (value?: number) => {
    if (typeof value !== 'number') {
      return '—';
    }
    return formatCurrency(value);
  };

  const careInstructions = Array.isArray(product.meta?.care)
    ? (product.meta?.care as string[])
    : [];
  const hsnCode = typeof product.meta?.hsn === 'string' ? (product.meta.hsn as string) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <RecordProductView product={product} />
      {/* Breadcrumb */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-foreground/60" aria-label="Breadcrumb">
            <span>Home</span>
            {product.category?.name && (
              <>
                <span aria-hidden="true">/</span>
                <span>{product.category.name}</span>
              </>
            )}
            {product.subcategory?.name && (
              <>
                <span aria-hidden="true">/</span>
                <span>{product.subcategory.name}</span>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span className="text-foreground font-medium">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-surface rounded-lg overflow-hidden aspect-square">
              {primaryImage ? (
                <Image
                  src={resolveProductImage(primaryImage.url)}
                  alt={primaryImage.alt || product.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-foreground/40 text-sm">
                  No product image
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-surface/80 backdrop-blur-sm p-2 rounded-full hover:bg-surface transition"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface/80 backdrop-blur-sm p-2 rounded-full hover:bg-surface transition"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <div
                    key={img.url + idx}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                      idx === 0 ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Image
                      src={resolveProductImage(img.url)}
                      alt={img.alt || product.title}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
                  {product.shortDescription && (
                    <p className="text-foreground/70 text-lg mb-3">{product.shortDescription}</p>
                  )}
                  {/* Review Stats */}
                  <div className="mb-4">
                    <ProductReviewStats productId={product._id} />
                  </div>
                </div>
                <div className="relative ml-4">
                  <ProductActions
                    productId={product._id}
                    minOrderQty={product.minOrderQty || 1}
                    stock={product.stock || 0}
                    isActive={product.isActive}
                    showTopActions={true}
                  />
                </div>
              </div>
              {product.sku && <p className="text-sm text-foreground/60">SKU: {product.sku}</p>}
            </div>

            {/* Pricing Section */}
            <div className="bg-surface rounded-lg p-6 space-y-4 border border-border">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">{formatMoney(priceUnit)}</span>
                <span className="text-foreground/60">per unit</span>
              </div>

              {/* {product.pricingTiers && product.pricingTiers.length > 0 && (
                <div className="bg-muted/20 rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Volume pricing</h3>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    {product.pricingTiers.map((tier) => (
                      <li key={tier.minQty} className="flex justify-between">
                        <span>{tier.minQty}+ units</span>
                        <span className="font-medium text-success">
                          {formatMoney(tier.pricePerUnit)} / unit
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}

              <ProductActions
                productId={product._id}
                minOrderQty={product.minOrderQty || 1}
                stock={product.stock || 0}
                isActive={product.isActive}
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {product.stock !== undefined && (
                <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                  <Package className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium text-sm">In Stock</div>
                    <div className="text-xs text-foreground/60">{product.stock} units available</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                <Truck className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-medium text-sm">Bulk fulfilment</div>
                  <div className="text-xs text-foreground/60">Fleet-ready shipping support</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-medium text-sm">Quality assured</div>
                  <div className="text-xs text-foreground/60">By verified suppliers</div>
                </div>
              </div>
              {hsnCode && (
                <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                  <Package className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium text-sm">HSN Code</div>
                    <div className="text-xs text-foreground/60">{hsnCode}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 bg-surface rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Description</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {product.description || 'Detailed product description will appear here.'}
              </p>
            </div>
            
            <div className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Specifications</h3>
              <dl className="space-y-2">
                {product.attributes && Object.entries(product.attributes).length > 0 ? (
                  Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <dt className="text-foreground/60 inline">{key}:</dt>
                      <dd className="text-foreground font-medium inline ml-2">{value}</dd>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-foreground/60">Specifications coming soon.</p>
                )}
              </dl>
            </div>
            
            <div className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Care Instructions</h3>
              <ul className="space-y-2">
                {careInstructions.length > 0 ? (
                  careInstructions.map((instruction, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground/70">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{instruction}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-foreground/60">Standard handling applies.</li>
                )}
              </ul>
            </div>
            
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews">
          <ReviewSection productId={product._id} productSlug={product.slug} />
        </div>
      </div>
    </div>
  );
}