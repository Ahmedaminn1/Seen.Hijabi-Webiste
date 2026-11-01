"use client";

import { useState } from "react";
import { updateVariantStock } from "@/lib/actions/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";

interface VariantItem {
  id: string;
  sku: string | null;
  productName: string;
  colorName: string;
  colorHex: string;
  sizeName: string;
  currentStock: number;
  lowStockThreshold: number;
}

export function InventoryTable({ initialVariants }: { initialVariants: VariantItem[] }) {
  const [variants, setVariants] = useState<VariantItem[]>(initialVariants);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>(
    Object.fromEntries(initialVariants.map((v) => [v.id, v.currentStock]))
  );
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [search, setSearch] = useState("");

  const handleUpdate = async (variantId: string) => {
    const qty = stockInputs[variantId];
    if (qty === undefined || qty < 0) return;

    setLoadingMap((prev) => ({ ...prev, [variantId]: true }));
    const res = await updateVariantStock(variantId, qty);
    setLoadingMap((prev) => ({ ...prev, [variantId]: false }));

    if (res.success) {
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, currentStock: qty } : v))
      );
      setSavedMap((prev) => ({ ...prev, [variantId]: true }));
      setTimeout(() => {
        setSavedMap((prev) => ({ ...prev, [variantId]: false }));
      }, 2000);
    }
  };

  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      v.productName.toLowerCase().includes(search.toLowerCase()) ||
      v.colorName.toLowerCase().includes(search.toLowerCase()) ||
      v.sizeName.toLowerCase().includes(search.toLowerCase()) ||
      (v.sku && v.sku.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === "out") return v.currentStock === 0;
    if (filter === "low") return v.currentStock > 0 && v.currentStock <= v.lowStockThreshold;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Input
          placeholder="ابحث بالاسم، اللون، المقاس، أو رمز SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs h-9 sm:max-w-xs"
        />

        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs h-8"
          >
            الكل ({variants.length})
          </Button>
          <Button
            variant={filter === "low" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("low")}
            className="text-xs h-8"
          >
            مخزون منخفض ({variants.filter((v) => v.currentStock > 0 && v.currentStock <= v.lowStockThreshold).length})
          </Button>
          <Button
            variant={filter === "out" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("out")}
            className="text-xs h-8"
          >
            نفد المخزون ({variants.filter((v) => v.currentStock === 0).length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">المنتج | Product</th>
                <th className="px-4 py-3">اللون | Color</th>
                <th className="px-4 py-3">المقاس | Size</th>
                <th className="px-4 py-3">رمز SKU</th>
                <th className="px-4 py-3">المخزون الحالي | Current</th>
                <th className="px-4 py-3">تحديث الكمية | Quick Update</th>
                <th className="px-4 py-3">الحالة | Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                    لا توجد أصناف مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredVariants.map((v) => (
                  <tr key={v.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      {v.productName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: v.colorHex }}
                        />
                        <span>{v.colorName}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">
                      {v.sizeName}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[var(--muted-foreground)]">
                      {v.sku || "-"}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {v.currentStock} قطعة
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min="0"
                          value={stockInputs[v.id] ?? v.currentStock}
                          onChange={(e) =>
                            setStockInputs({ ...stockInputs, [v.id]: Number(e.target.value) })
                          }
                          className="w-20 h-7 text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            loadingMap[v.id] || stockInputs[v.id] === v.currentStock
                          }
                          onClick={() => handleUpdate(v.id)}
                          className="h-7 px-2 text-[11px]"
                        >
                          {loadingMap[v.id] ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : savedMap[v.id] ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            "حفظ"
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {v.currentStock === 0 ? (
                        <Badge variant="destructive" className="text-[10px]">
                          نفد المخزون (Sold Out)
                        </Badge>
                      ) : v.currentStock <= v.lowStockThreshold ? (
                        <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300 bg-amber-50">
                          منخفض ({v.currentStock})
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] text-emerald-700 bg-emerald-50">
                          متوفر
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
