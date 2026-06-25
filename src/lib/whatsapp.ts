export function getWholesaleWhatsAppHref(productTitle?: string): string {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? '919125842411';

  const message = productTitle
    ? `Hello, I am interested in wholesale orders for ${productTitle}.`
    : 'Hello, I am interested in wholesale orders.';

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
