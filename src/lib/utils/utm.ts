/**
 * UTM tracking utilities.
 *
 * Captures UTM parameters from the URL on the first page visit and stores
 * them in sessionStorage so they persist through the shopping session.
 * At checkout, the source is read from sessionStorage and saved to the order.
 *
 * We use sessionStorage (not localStorage) so the source resets with each
 * new browser tab / session, which is more accurate for attribution.
 */

export type OrderSource =
  | "website"
  | "instagram"
  | "tiktok"
  | "whatsapp"
  | "facebook"
  | "direct"
  | "other";

const SESSION_KEY = "sh_utm_source";

/**
 * Map a raw utm_source value to our canonical OrderSource enum.
 */
function mapUtmSource(raw: string | null): OrderSource {
  if (!raw) return "direct";
  const lower = raw.toLowerCase();
  if (lower === "instagram" || lower === "ig") return "instagram";
  if (lower === "tiktok" || lower === "tt") return "tiktok";
  if (lower === "whatsapp" || lower === "wa") return "whatsapp";
  if (lower === "facebook" || lower === "fb") return "facebook";
  if (lower === "website") return "website";
  return "other";
}

/**
 * Call this on the client (e.g. in a layout useEffect) to capture UTM params.
 * Only captures if not already stored in the session.
 */
export function captureUtmSource(): void {
  if (typeof window === "undefined") return;

  // Don't overwrite an existing attribution for this session
  if (sessionStorage.getItem(SESSION_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");

  // Fall back to document.referrer if no UTM param
  let source: OrderSource = "direct";
  if (utmSource) {
    source = mapUtmSource(utmSource);
  } else if (document.referrer) {
    const referrer = new URL(document.referrer).hostname;
    if (referrer.includes("instagram")) source = "instagram";
    else if (referrer.includes("tiktok")) source = "tiktok";
    else if (referrer.includes("facebook") || referrer.includes("fb."))
      source = "facebook";
    else if (referrer.includes("whatsapp")) source = "whatsapp";
    else source = "other";
  }

  sessionStorage.setItem(SESSION_KEY, source);
}

/**
 * Get the stored order source (call at checkout time).
 */
export function getOrderSource(): OrderSource {
  if (typeof window === "undefined") return "website";
  const stored = sessionStorage.getItem(SESSION_KEY);
  return (stored as OrderSource) ?? "website";
}

