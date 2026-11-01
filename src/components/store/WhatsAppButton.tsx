"use client";

import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  whatsappNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppButton({
  whatsappNumber = "+201000000000",
  defaultMessage = "مرحباً، أود الاستفسار عن منتجات متجر سين حجابي | Hello, I would like to ask about Seen Hijabi products",
}: WhatsAppButtonProps) {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside aria-label="محادثة واتساب">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا عبر واتساب | Chat on WhatsApp"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-3.5 py-2.5 rounded-full shadow-sm hover:brightness-105 active:scale-95 transition-all duration-150"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline text-xs font-medium">
          تواصل معنا عبر واتساب
        </span>
      </a>
    </aside>
  );
}
