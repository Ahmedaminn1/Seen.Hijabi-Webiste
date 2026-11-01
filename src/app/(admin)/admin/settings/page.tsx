import { getStoreSettings, getShippingSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [storeSettings, shippingSettings] = await Promise.all([
    getStoreSettings(),
    getShippingSettings(),
  ]);

  if (!storeSettings || !shippingSettings) {
    return (
      <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
        تعذر تحميل إعدادات المتجر حالياً
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[var(--border)]">
        <h1 className="text-xl font-serif tracking-tight text-[var(--foreground)]">
          إعدادات المتجر والشحن | Store & Shipping Settings
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          تحكم في اسم المتجر، روابط التواصل، الشحن المجاني، ورقم الواتساب دون تعديل أي كود برمجياً
        </p>
      </div>

      <SettingsForm
        initialStore={storeSettings}
        initialShipping={shippingSettings}
      />
    </div>
  );
}
