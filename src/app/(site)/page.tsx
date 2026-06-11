import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  HeartPulse,
  Factory,
  Warehouse,
  HardHat,
  MapPin,
  Quote,
} from "lucide-react";
import FadeIn from "@/components/FadeIn";
import FAQAccordion from "@/components/FAQAccordion";
import ComplianceLadder from "@/components/ComplianceLadder";
import {
  SITE,
  SERVICES,
  PROCESS_STEPS,
  RISKS,
  HOMEPAGE_FAQS,
  getWhatsAppLink,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Stay DoL-Compliant. Avoid Fines. Protect Your People.",
  description:
    "Outsourced OHS compliance for manufacturers, warehouses, and engineering firms across Gauteng and Limpopo — without the overhead of a full-time safety officer. Get a free compliance assessment.",
};

const RISK_ICONS = [Gavel, AlertTriangle, HeartPulse];

export default function HomePage() {
  return (
    <>
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.18),_transparent_55%)]" />
        <div className="container-page relative section-padding">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow">OHS Compliance Specialists &middot; Gauteng &amp; Limpopo</p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl">
                Stay DoL-Compliant. Avoid Fines.{" "}
                <span className="text-orange">Protect Your People.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-100">
                VDW Health &amp; Safety Solutions provides outsourced OHS compliance for
                manufacturers, warehouses, and engineering firms across Gauteng and
                Limpopo — without the overhead of a full-time safety officer.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href={SITE.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Get My Free Compliance Assessment
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </div>
              <p className="mt-4 text-sm text-navy-200">
                Free 5-minute assessment &middot; No obligation &middot; No sales call required
              </p>
            </div>

            <div className="lg:col-span-5">
              <FadeIn>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-sm sm:p-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-orange">
                    Free Compliance Assessment
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold">
                    Where does your business stand right now?
                  </h2>
                  <ul className="mt-6 space-y-3 text-sm text-navy-100">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                      Instant snapshot of your OHS compliance status
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                      Identifies your highest-risk gaps first
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                      Built on the OHS Act No. 85 of 1993 framework
                    </li>
                  </ul>
                  <a
                    href={SITE.assessmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-6 w-full"
                  >
                    Take the Free Assessment
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="border-t border-white/10 bg-navy-900/60">
          <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-6 text-sm font-semibold text-navy-100 sm:justify-between">
            <span className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-orange" /> Manufacturing
            </span>
            <span className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-orange" /> Warehousing
            </span>
            <span className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-orange" /> Engineering
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange" /> Gauteng &amp; Limpopo
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM / STAKES */}
      <section className="section-padding bg-offwhite">
        <div className="container-page">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow justify-center">The cost of waiting</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
                Every Day Without a Compliant H&amp;S System Is a Liability
              </h2>
              <p className="mt-4 text-lg text-navy-600">
                Compliance gaps don&apos;t announce themselves — until an inspector, an
                incident, or a client audit forces the issue. By then, the cost is
                always higher than the fix.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {RISKS.map((risk, index) => {
              const Icon = RISK_ICONS[index];
              return (
                <FadeIn key={risk.title} delay={index * 0.1}>
                  <div className="h-full rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange/10">
                      <Icon className="h-6 w-6 text-orange" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold text-navy">
                      {risk.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy-600">
                      {risk.description}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={0.2}>
            <div className="mt-10 flex justify-center">
              <a href={SITE.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Find Out My Risk Level — Free Assessment
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 3: SERVICES OVERVIEW */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow justify-center">How we help</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
                What VDW Does For Your Business
              </h2>
              <p className="mt-4 text-lg text-navy-600">
                Practical, structured OHS support — built around your operation, not a
                one-size-fits-all template.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <FadeIn key={service.slug} delay={(index % 3) * 0.1}>
                  <div className="flex h-full flex-col rounded-2xl border border-navy-100 bg-offwhite p-6 shadow-card sm:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
                      <Icon className="h-6 w-6 text-navy" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold text-navy">
                      {service.name}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">
                      {service.shortBenefit}
                    </p>
                    <Link
                      href={`/services#${service.slug}`}
                      className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-orange hover:text-orange-dark"
                    >
                      Learn more
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </FadeIn>
              );
            })}

            <FadeIn delay={0.3}>
              <div className="flex h-full flex-col items-start justify-center rounded-2xl bg-navy p-6 text-white sm:p-8">
                <h3 className="font-display text-xl font-bold">
                  Not sure what you need?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-100">
                  Start with our free compliance assessment and we&apos;ll show you
                  exactly where the gaps are.
                </p>
                <a
                  href={SITE.assessmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5"
                >
                  Start with a Free Assessment
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* COMPLIANCE LADDER */}
      <ComplianceLadder />

      {/* SECTION 4: HOW IT WORKS */}
      <section className="section-padding bg-navy-50">
        <div className="container-page">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow justify-center">Our process</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
                Simple. Structured. Compliant.
              </h2>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {PROCESS_STEPS.map((step, index) => (
              <FadeIn key={step.number} delay={index * 0.1}>
                <div className="relative h-full rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
                  <span className="font-display text-5xl font-bold text-orange/20">
                    {step.number}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-navy">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-600">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: SOCIAL PROOF */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow justify-center">Trusted locally</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
                Trusted by Gauteng &amp; Limpopo SMEs
              </h2>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {["Manufacturing", "Warehousing", "Engineering"].map((industry, index) => (
              <FadeIn key={industry} delay={index * 0.1}>
                <div className="flex h-full flex-col rounded-2xl border border-dashed border-navy-200 bg-offwhite p-6 sm:p-8">
                  <Quote className="h-8 w-8 text-orange/40" />
                  <p className="mt-4 flex-1 text-sm italic leading-relaxed text-navy-400">
                    &ldquo;Client testimonial placeholder — feedback from a {industry.toLowerCase()}{" "}
                    business will appear here.&rdquo;
                  </p>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-navy-300">
                    Client testimonial &mdash; {industry}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-10 rounded-2xl border border-navy-100 bg-navy-50 px-6 py-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-navy-400">
                Clients include businesses in
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-navy-500">
                <span className="flex items-center gap-2 font-semibold">
                  <Factory className="h-5 w-5" /> Manufacturing
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <HardHat className="h-5 w-5" /> Engineering
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Warehouse className="h-5 w-5" /> Warehousing
                </span>
              </div>
              <p className="mt-3 text-xs text-navy-400">
                Logo placeholders — to be populated with client logos
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 6: FREE ASSESSMENT CTA BLOCK */}
      <section className="bg-navy text-white">
        <div className="container-page section-padding text-center">
          <FadeIn>
            <p className="eyebrow justify-center">Free &amp; no obligation</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl text-balance">
              Find Out Exactly Where Your Business Stands
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-100">
              Our free compliance assessment takes less than 5 minutes and gives you a
              clear picture of your OHS risk exposure.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <a href={SITE.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Take the Free Assessment Now
                <ArrowRight className="h-5 w-5" />
              </a>
              <p className="text-sm text-navy-200">
                No obligation. No sales call required.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 7: FAQ */}
      <section className="section-padding bg-offwhite">
        <div className="container-page">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow justify-center">Common questions</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
                Frequently Asked Questions
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mx-auto mt-10 max-w-3xl">
              <FAQAccordion faqs={HOMEPAGE_FAQS} />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-card sm:p-8">
              <h3 className="font-display text-xl font-bold text-navy">
                Still have questions?
              </h3>
              <p className="mt-2 text-sm text-navy-600">
                Message us directly on WhatsApp — we typically respond within the same
                business day.
              </p>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp mt-5 inline-flex"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
