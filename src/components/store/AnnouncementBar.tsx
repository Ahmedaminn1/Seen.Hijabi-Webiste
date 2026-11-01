import { formatPrice } from "@/lib/utils/pricing";

interface AnnouncementBarProps {
  announcementText?: string | null;
  announcementEnabled?: boolean;
  freeShippingEnabled?: boolean;
  freeShippingMinAmount?: number | null;
  freeShippingMinQty?: number | null;
}

export function AnnouncementBar({
  announcementText,
  announcementEnabled = true,
  freeShippingEnabled = true,
  freeShippingMinAmount = 1000,
  freeShippingMinQty = 2,
}: AnnouncementBarProps) {
  if (!announcementEnabled) return null;

  // Dynamic message based on DB settings
  const defaultShippingMsg = freeShippingEnabled
    ? freeShippingMinAmount && freeShippingMinQty
      ? `شحن مجاني لجميع محافظات مصر للطلبات من ${formatPrice(freeShippingMinAmount)} أو عند طلب ${freeShippingMinQty} قطع فأكثر`
      : freeShippingMinAmount
      ? `شحن مجاني للطلبات بقيمة ${formatPrice(freeShippingMinAmount)} فأكثر`
      : "شحن مجاني متاح لجميع الطلبات المؤهلة"
    : null;

  const displayMessage = announcementText || defaultShippingMsg;
  if (!displayMessage) return null;

  return (
    <div className="bg-[var(--primary)] text-[var(--primary-foreground)] text-[11px] py-2 px-4 text-center tracking-wide font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span>{displayMessage}</span>
      </div>
    </div>
  );
}

