'use client';

import { useEffect } from 'react';

import { addToBrowseHistory } from '@/utils/browseHistory';

type RecordProductViewProps = {
  product: {
    _id: string;
    slug: string;
    title: string;
    price?: number;
    images?: Array<{ url: string; alt?: string }>;
    vendor?: { name?: string } | string | null;
  };
};

export function RecordProductView({ product }: RecordProductViewProps) {
  useEffect(() => {
    if (!product?._id || !product?.slug) return;

    const vendorName =
      typeof product.vendor === 'string'
        ? product.vendor
        : product.vendor && typeof product.vendor === 'object'
          ? (product.vendor as any).name
          : undefined;

    addToBrowseHistory({
      id: product._id,
      slug: product.slug,
      name: product.title,
      price: typeof product.price === 'number' ? product.price : undefined,
      image: product.images?.[0]?.url,
      vendor: vendorName,
    });
  }, [product]);

  return null;
}


