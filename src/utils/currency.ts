const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

export const formatCurrency = (
  value: number,
  locale = "en-IN",
  currency = "INR",
  maximumFractionDigits = 0
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(value);

export const resolveProductImage = (url?: string | null) => {
  if (!url || !url.trim()) {
    return FALLBACK_IMAGE;
  }
  return url;
};


