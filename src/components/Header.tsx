"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, MessageCircle, X, ShieldCheck } from "lucide-react";
import { NAV_LINKS, SITE, getWhatsAppLink } from "@/lib/data";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <ShieldCheck className="h-7 w-7 text-orange" />
          <span className="font-display text-lg font-bold leading-tight text-navy sm:text-xl">
            VDW <span className="font-sans font-semibold text-navy-500">Health &amp; Safety Solutions</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-navy-700 transition-colors hover:text-orange"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-[#25D366] px-4 py-2.5 text-sm font-semibold text-[#1DAE54] transition-colors hover:bg-[#25D366] hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
          <a
            href={SITE.assessmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-orange px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-orange-dark"
          >
            Get Free Assessment
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-100 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Primary mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-base font-semibold text-navy-700 hover:bg-navy-50 hover:text-orange"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <a
              href={SITE.assessmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
            >
              Get Free Assessment
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
