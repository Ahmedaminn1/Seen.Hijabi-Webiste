"use client";

import { useState } from "react";
import { updateStoreSettings, updateShippingSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertCircle } from "lucide-react";

interface SettingsFormProps {
  initialStore: {
    storeName: string;
    logoUrl: string | null;
    whatsappNumber: string;
    instagramUrl: string | null;
    tiktokUrl: string | null;
    facebookUrl: string | null;
    currency: string;
    announcementText: string | null;
    announcementEnabled: boolean;
  };
  initialShipping: {
    id?: string;
    freeShippingEnabled: boolean;
    freeShippingMinAmount: number | null;
    freeShippingMinQty: number | null;
    fixedShippingCost: number;
  };
}

export function SettingsForm({ initialStore, initialShipping }: SettingsFormProps) {
  const [store, setStore] = useState(initialStore);
  const [shipping, setShipping] = useState({
    freeShippingEnabled: initialShipping.freeShippingEnabled,
    freeShippingMinAmount: Number(initialShipping.freeShippingMinAmount ?? 1000),
    freeShippingMinQty: initialShipping.freeShippingMinQty ?? 2,
    fixedShippingCost: Number(initialShipping.fixedShippingCost ?? 65),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const [storeRes, shipRes] = await Promise.all([
        updateStoreSettings(store),
        updateShippingSettings(shipping),
      ]);

      if (!storeRes.success || !shipRes.success) {
        setErrorMessage(storeRes.error || shipRes.error || "حدث خطأ أثناء حفظ الإعدادات");
      } else {
        setSuccessMessage("تم حفظ إعدادات المتجر والشحن بنجاح!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("حدث خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {successMessage && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. General Brand Settings */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
          1. بيانات المتجر والهوية | Store Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">اسم المتجر | Store Name</Label>
            <Input
              value={store.storeName}
              onChange={(e) => setStore({ ...store, storeName: e.target.value })}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">العملة الافتراضية | Currency</Label>
            <Input
              value={store.currency}
              onChange={(e) => setStore({ ...store, currency: e.target.value })}
              className="text-xs h-9"
              placeholder="EGP"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">رابط الشعار | Logo URL</Label>
          <Input
            value={store.logoUrl || ""}
            onChange={(e) => setStore({ ...store, logoUrl: e.target.value })}
            placeholder="https://.../logo.png"
            className="text-xs h-9"
          />
        </div>
      </div>

      {/* 2. Announcement Bar */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            2. شريط الإعلانات أعلى الصفحة | Announcement Bar
          </h2>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={store.announcementEnabled}
              onChange={(e) => setStore({ ...store, announcementEnabled: e.target.checked })}
              className="rounded-sm border-[var(--border)] text-[var(--primary)]"
            />
            <span>تفعيل الشريط | Enabled</span>
          </label>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">نص الإعلان | Announcement Text</Label>
          <Textarea
            rows={2}
            value={store.announcementText || ""}
            onChange={(e) => setStore({ ...store, announcementText: e.target.value })}
            placeholder="مثال: شحن مجاني للطلبات أكثر من 1000 جنيه أو قطعتين فأكثر"
            className="text-xs"
          />
        </div>
      </div>

      {/* 3. Shipping & Free Shipping Rules */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              3. تكلفة وقواعد الشحن المجاني | Shipping Rules
            </h2>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              تتحكم في حساب الشحن التلقائي وظهور شريط التقدم للعميل
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={shipping.freeShippingEnabled}
              onChange={(e) =>
                setShipping({ ...shipping, freeShippingEnabled: e.target.checked })
              }
              className="rounded-sm border-[var(--border)] text-[var(--primary)]"
            />
            <span>تفعيل الشحن المجاني</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">سعر الشحن الثابت (ج.م) | Fixed Shipping</Label>
            <Input
              type="number"
              min="0"
              value={shipping.fixedShippingCost}
              onChange={(e) =>
                setShipping({ ...shipping, fixedShippingCost: Number(e.target.value) })
              }
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">الحد الأدنى للقيمة للشحن المجاني (ج.م)</Label>
            <Input
              type="number"
              min="0"
              disabled={!shipping.freeShippingEnabled}
              value={shipping.freeShippingMinAmount}
              onChange={(e) =>
                setShipping({ ...shipping, freeShippingMinAmount: Number(e.target.value) })
              }
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">أو الحد الأدنى لعدد القطع للشحن المجاني</Label>
            <Input
              type="number"
              min="1"
              disabled={!shipping.freeShippingEnabled}
              value={shipping.freeShippingMinQty}
              onChange={(e) =>
                setShipping({ ...shipping, freeShippingMinQty: Number(e.target.value) })
              }
              className="text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* 4. Social & WhatsApp */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
          4. وسائل التواصل والواتساب | Social & Contacts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">رقم الواتساب للزر العائم | WhatsApp Number *</Label>
            <Input
              value={store.whatsappNumber}
              onChange={(e) => setStore({ ...store, whatsappNumber: e.target.value })}
              placeholder="+201000000000"
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">رابط انستجرام | Instagram URL</Label>
            <Input
              value={store.instagramUrl || ""}
              onChange={(e) => setStore({ ...store, instagramUrl: e.target.value })}
              placeholder="https://www.instagram.com/seen.hijabi/"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">رابط تيك توك | TikTok URL</Label>
            <Input
              value={store.tiktokUrl || ""}
              onChange={(e) => setStore({ ...store, tiktokUrl: e.target.value })}
              placeholder="https://www.tiktok.com/@seen.hijabi"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">رابط فيسبوك | Facebook URL</Label>
            <Input
              value={store.facebookUrl || ""}
              onChange={(e) => setStore({ ...store, facebookUrl: e.target.value })}
              placeholder="https://www.facebook.com/seen.hijabi"
              className="text-xs h-9"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="text-xs h-9 px-6 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-medium"
        >
          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات | Save Settings"}
        </Button>
      </div>
    </form>
  );
}

