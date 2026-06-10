import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/data";

export default function MobileStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-navy-700 bg-navy px-4 py-3 sm:hidden">
      <a
        href={SITE.assessmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange px-4 py-3 text-sm font-semibold text-white shadow-card"
      >
        Get My Free Compliance Assessment
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
