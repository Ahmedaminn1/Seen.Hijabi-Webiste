/**
 * Pricing utility functions.
 *
 * All calculations happen server-side. Never call these from client components
 * with data that originates from the user (frontend form values, URL params, etc.).
 */

/**
 * Calculate the discounted price for a product.
 * @param originalPrice - The regular price in EGP (stored as Decimal in DB)
 * @param discountPercent - Percentage discount (0-100). Pass 0 or null for no discount.
 * @returns The final price rounded to 2 decimal places.
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discountPercent: number | null
): number {
  if (!discountPercent || discountPercent <= 0 || discountPercent > 100) {
    return originalPrice;
  }
  const discounted = originalPrice * (1 - discountPercent / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Calculate the shipping fee for an order.
 * Free shipping is granted when:
 *   - Total subtotal >= freeShippingMinAmount, OR
 *   - Total item quantity >= freeShippingMinQty
 *
 * @param subtotal - Cart subtotal in EGP (after discounts, before shipping)
 * @param totalQty - Total number of items in the cart
 * @param settings - Shipping settings from the DB
 */
export function calculateShippingFee(
  subtotal: number,
  totalQty: number,
  settings: {
    freeShippingEnabled: boolean;
    freeShippingMinAmount: number | null;
    freeShippingMinQty: number | null;
    fixedShippingCost: number;
  }
): { fee: number; isFree: boolean } {
  if (!settings.freeShippingEnabled) {
    return { fee: settings.fixedShippingCost, isFree: false };
  }

  const qualifiesByAmount =
    settings.freeShippingMinAmount !== null &&
    subtotal >= settings.freeShippingMinAmount;

  const qualifiesByQty =
    settings.freeShippingMinQty !== null &&
    totalQty >= settings.freeShippingMinQty;

  const isFree = qualifiesByAmount || qualifiesByQty;

  return {
    fee: isFree ? 0 : settings.fixedShippingCost,
    isFree,
  };
}

/**
 * Calculate how much more a customer needs to spend for free shipping.
 * Returns null if free shipping is already unlocked or not enabled.
 */
export function getFreeShippingProgress(
  subtotal: number,
  totalQty: number,
  settings: {
    freeShippingEnabled: boolean;
    freeShippingMinAmount: number | null;
    freeShippingMinQty: number | null;
  }
): {
  amountNeeded: number | null;
  qtyNeeded: number | null;
  isUnlocked: boolean;
} {
  if (!settings.freeShippingEnabled) {
    return { amountNeeded: null, qtyNeeded: null, isUnlocked: false };
  }

  const qualifiesByAmount =
    settings.freeShippingMinAmount !== null &&
    subtotal >= settings.freeShippingMinAmount;

  const qualifiesByQty =
    settings.freeShippingMinQty !== null &&
    totalQty >= settings.freeShippingMinQty;

  if (qualifiesByAmount || qualifiesByQty) {
    return { amountNeeded: null, qtyNeeded: null, isUnlocked: true };
  }

  const amountNeeded =
    settings.freeShippingMinAmount !== null
      ? Math.max(0, settings.freeShippingMinAmount - subtotal)
      : null;

  const qtyNeeded =
    settings.freeShippingMinQty !== null
      ? Math.max(0, settings.freeShippingMinQty - totalQty)
      : null;

  return { amountNeeded, qtyNeeded, isUnlocked: false };
}

/**
 * Format a number as Egyptian Pounds.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

