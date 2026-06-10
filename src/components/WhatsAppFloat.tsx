"use client";

import { MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/lib/data";

export default function WhatsAppFloat() {
  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-110 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </a>
  );
}
