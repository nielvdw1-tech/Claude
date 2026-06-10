import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, MapPin, Mail } from "lucide-react";
import { NAV_LINKS, SITE, getWhatsAppLink } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-navy text-navy-100">
      <div className="container-page section-padding grid gap-12 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-orange" />
            <span className="font-display text-xl font-bold text-white">
              VDW <span className="font-sans font-semibold text-navy-200">Health &amp; Safety Solutions</span>
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-navy-200">
            Outsourced OHS compliance for manufacturing, warehousing, and engineering SMEs —
            so you can run your operation without the constant worry of an inspection,
            a fine, or an incident catching you off guard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <a href={SITE.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Get My Free Compliance Assessment
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-white">Navigate</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-orange">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/free-assessment" className="transition-colors hover:text-orange">
                Free Assessment
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-white">Get In Touch</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
              <span>Serving {SITE.region} — on-site &amp; remote support</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
              <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-orange">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-orange">
                Message us on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-700">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-navy-300 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} VDW Health &amp; Safety Solutions. All rights reserved.</p>
          <p>Serving Gauteng &amp; Limpopo &middot; {SITE.domain}</p>
        </div>
      </div>
    </footer>
  );
}
