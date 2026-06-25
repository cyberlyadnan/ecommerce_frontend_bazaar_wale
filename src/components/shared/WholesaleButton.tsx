import { getWholesaleWhatsAppHref } from '@/lib/whatsapp';

interface WholesaleButtonProps {
  productTitle?: string;
  className?: string;
  compact?: boolean;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.52 3.48A11.3 11.3 0 0012.01 0C5.37 0 .17 5.2.17 11.84c0 2.08.54 4.12 1.57 5.92L0 24l6.46-1.69A11.8 11.8 0 0011.97 24h.01c6.64 0 11.84-5.2 11.84-11.84 0-3.17-1.24-6.14-3.3-8.49zM12 21.5c-1.2 0-2.38-.32-3.4-.93l-.24-.14-3.83 1.01 1.02-3.73-.16-.27A8.7 8.7 0 013.5 11.84C3.5 7.05 7.21 3.34 12 3.34c2.28 0 4.4.87 6 2.44 1.57 1.56 2.44 3.67 2.44 5.99 0 4.79-3.7 8.5-8.5 8.5zM17.03 14.06c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.6.07-.27-.14-1.13-.42-2.15-1.33-.8-.71-1.34-1.58-1.5-1.84-.16-.27-.02-.42.12-.56.12-.12.27-.32.4-.48.14-.16.18-.27.27-.46.09-.18 0-.34-.05-.47-.06-.14-.61-1.48-.84-2.03-.22-.52-.45-.45-.61-.45-.16 0-.34 0-.53 0-.18 0-.47.07-.72.34-.25.27-.96.94-.96 2.3 0 1.36.98 2.68 1.12 2.86.14.18 1.94 3.02 4.7 4.23 1.8.77 2.56.85 3.48.71.55-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
    </svg>
  );
}

export function WholesaleButton({ productTitle, className = '', compact = false }: WholesaleButtonProps) {
  const href = getWholesaleWhatsAppHref(productTitle);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white font-semibold whitespace-nowrap hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md ${
        compact
          ? 'px-3 py-2 text-xs font-bold'
          : 'px-3 lg:px-4 py-1.5 text-sm'
      } ${className}`}
    >
      <WhatsAppIcon className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {compact ? (
        <>
          <span className="hidden sm:inline">For Wholesale</span>
          <span className="sm:hidden">Wholesale</span>
        </>
      ) : (
        <>
          <span className="hidden lg:inline">For Wholesale</span>
          <span className="lg:hidden">Wholesale</span>
        </>
      )}
    </a>
  );
}
