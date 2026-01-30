'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  loading = false,
  className = '',
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (totalPages <= 1 && total <= limit) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border bg-muted/20 ${className}`}
    >
      <p className="text-sm text-muted order-2 sm:order-1">
        Showing <span className="font-medium text-foreground">{start}</span> to{' '}
        <span className="font-medium text-foreground">{end}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span> results
      </p>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-surface text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-foreground min-w-[100px] text-center">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-surface text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
