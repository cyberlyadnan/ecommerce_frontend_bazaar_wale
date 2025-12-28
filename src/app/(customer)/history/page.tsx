'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Eye } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { formatCurrency } from '@/utils/currency';
import { clearBrowseHistory, getBrowseHistory } from '@/utils/browseHistory';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(getBrowseHistory());
  }, []);

  const historyItems = useMemo(() => {
    // sort newest first (defensive)
    return [...(items as any[])].sort((a, b) => {
      const at = new Date(a.viewedAt ?? 0).getTime();
      const bt = new Date(b.viewedAt ?? 0).getTime();
      return bt - at;
    });
  }, [items]);

  const handleClear = () => {
    clearBrowseHistory();
    setItems([]);
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Browse History</h1>
            <p className="text-muted mt-2">Products you've recently viewed</p>
          </div>
          <button
            onClick={handleClear}
            disabled={historyItems.length === 0}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear History
          </button>
        </div>

        {historyItems.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No history yet</h3>
            <p className="text-muted mb-6">Start browsing products to see your history here</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((product: any) => (
              <div
                key={product.slug ?? product.id}
                className="bg-surface rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex gap-4">
                  <Link href={`/products/${product.slug ?? product.id}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted/20">
                      <Image
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="96px"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.slug ?? product.id}`}>
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    {product.vendor && <p className="text-sm text-muted mb-2">{product.vendor}</p>}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {typeof product.price === 'number' && (
                          <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(product.viewedAt)}</span>
                        </div>
                      </div>
                      <Link
                        href={`/products/${product.slug ?? product.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Again
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

