import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { COMPLIANCE_LADDER, SITE, getWhatsAppLink, type LadderTier } from "@/lib/data";

const BADGE_STYLES: Record<LadderTier["badgeStyle"], string> = {
  free: "bg-navy-100 text-navy-600",
  popular: "bg-orange text-white",
  premium: "bg-navy text-orange",
};

const CARD_STYLES: Record<LadderTier["badgeStyle"], string> = {
  free: "border border-navy-100 bg-white",
  popular: "border-2 border-orange bg-white shadow-card lg:-translate-y-4 lg:scale-[1.03]",
  premium: "border border-navy-700 bg-navy text-white shadow-card",
};

export default function ComplianceLadder() {
  return (
    <section id="compliance-ladder" className="section-padding scroll-mt-20 bg-offwhite">
      <div className="container-page">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow justify-center">The compliance ladder</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
              Three Ways We Work With You
            </h2>
            <p className="mt-4 text-lg text-navy-600">
              We work with you in three ways — start free, build your system, then
              stay protected.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-center lg:gap-8">
          {COMPLIANCE_LADDER.map((tier, index) => {
            const Icon = tier.icon;
            const isPremium = tier.badgeStyle === "premium";

            const ctaHref =
              tier.cta.type === "assessment"
                ? SITE.assessmentUrl
                : getWhatsAppLink(
                    `Hi VDW Health & Safety Solutions, I'd like a quote for: ${tier.headline}.`
                  );

            return (
              <FadeIn key={tier.tier} delay={index * 0.1}>
                <div className={`flex h-full flex-col rounded-2xl p-6 sm:p-8 ${CARD_STYLES[tier.badgeStyle]}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-xs font-semibold uppercase tracking-widest ${
                        isPremium ? "text-navy-300" : "text-navy-400"
                      }`}
                    >
                      {tier.tier}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${BADGE_STYLES[tier.badgeStyle]}`}
                    >
                      {tier.badge}
                    </span>
                  </div>

                  <div
                    className={`mt-5 flex h-12 w-12 items-center justify-center rounded-xl ${
                      isPremium ? "bg-orange/10" : "bg-orange/10"
                    }`}
                  >
                    <Icon className="h-6 w-6 text-orange" />
                  </div>

                  <h3 className={`mt-5 font-display text-xl font-bold sm:text-2xl ${isPremium ? "text-white" : "text-navy"} text-balance`}>
                    {tier.headline}
                  </h3>

                  {tier.subheadline && (
                    <p className={`mt-2 text-sm font-semibold ${isPremium ? "text-orange" : "text-orange-dark"}`}>
                      {tier.subheadline}
                    </p>
                  )}

                  <p className={`mt-3 text-sm leading-relaxed ${isPremium ? "text-navy-100" : "text-navy-600"}`}>
                    {tier.description}
                  </p>

                  {tier.price && (
                    <p className={`mt-4 font-display text-2xl font-bold ${isPremium ? "text-white" : "text-navy"}`}>
                      {tier.price}
                    </p>
                  )}

                  <ul className="mt-5 space-y-2.5">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-2.5 text-sm ${isPremium ? "text-navy-100" : "text-navy-600"}`}
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {tier.cta.type === "assessment" ? (
                      <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                        {tier.cta.label}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                        <MessageCircle className="h-4 w-4" />
                        {tier.cta.label}
                      </a>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
