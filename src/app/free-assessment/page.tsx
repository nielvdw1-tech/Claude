import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ShieldCheck, ClipboardList, Target, FileSearch } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import FAQAccordion from "@/components/FAQAccordion";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { SITE, ASSESSMENT_FAQS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Free DoL Compliance Assessment | VDW Health & Safety Solutions",
  description:
    "Find out if your business is DoL-ready with a free 5-minute OHS compliance assessment, built on the OHS Act No. 85 of 1993 framework.",
};

const BENEFITS = [
  {
    icon: FileSearch,
    title: "A clear picture of your compliance gaps",
    description:
      "See exactly which areas of your H&S system meet the OHS Act requirements — and which don't.",
  },
  {
    icon: Target,
    title: "Your top risk areas, prioritised",
    description:
      "Understand which gaps carry the highest legal and safety risk, so you know what to act on first.",
  },
  {
    icon: ClipboardList,
    title: "A practical next-step plan",
    description:
      "Walk away with a clear understanding of what a compliant H&S system looks like for your business.",
  },
];

export default function FreeAssessmentPage() {
  return (
    <>
        <main>
          {/* HERO */}
          <section className="bg-navy text-white">
            <div className="container-page section-padding text-center">
              <FadeIn>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10">
                  <ShieldCheck className="h-7 w-7 text-orange" />
                </div>
                <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold sm:text-5xl lg:text-6xl text-balance">
                  Find Out If Your Business Is DoL-Ready — Free
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-navy-100">
                  A 5-minute assessment that shows exactly where your OHS compliance
                  gaps are — before a DoL inspector does.
                </p>
                <div className="mt-10 flex justify-center">
                  <a
                    href={SITE.assessmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !px-10 !py-5 text-lg"
                  >
                    Take the Free Assessment Now
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
                <p className="mt-4 text-sm text-navy-200">
                  Takes less than 5 minutes &middot; No obligation &middot; No sales call required
                </p>
              </FadeIn>
            </div>
          </section>

          {/* WHAT YOU GET */}
          <section className="section-padding bg-white">
            <div className="container-page">
              <FadeIn>
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
                    What You&apos;ll Get From the Assessment
                  </h2>
                </div>
              </FadeIn>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {BENEFITS.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <FadeIn key={benefit.title} delay={index * 0.1}>
                      <div className="h-full rounded-2xl border border-navy-100 bg-offwhite p-6 shadow-card sm:p-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange/10">
                          <Icon className="h-6 w-6 text-orange" />
                        </div>
                        <h3 className="mt-5 font-display text-lg font-bold text-navy">
                          {benefit.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-navy-600">
                          {benefit.description}
                        </p>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>

              <FadeIn delay={0.3}>
                <div className="mt-12 flex justify-center">
                  <a
                    href={SITE.assessmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !px-10 !py-5 text-lg"
                  >
                    Take the Free Assessment Now
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* TRUST SIGNALS */}
          <section className="bg-navy-50 py-10">
            <div className="container-page">
              <FadeIn>
                <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-10">
                  <span className="flex items-center gap-2 text-sm font-semibold text-navy-600">
                    <CheckCircle2 className="h-5 w-5 text-orange" />
                    Used by SMEs across Gauteng &amp; Limpopo
                  </span>
                  <span className="hidden h-6 w-px bg-navy-200 sm:block" />
                  <span className="flex items-center gap-2 text-sm font-semibold text-navy-600">
                    <CheckCircle2 className="h-5 w-5 text-orange" />
                    Built on the OHS Act No. 85 of 1993 framework
                  </span>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* FAQ */}
          <section className="section-padding bg-white">
            <div className="container-page">
              <FadeIn>
                <div className="mx-auto max-w-3xl text-center">
                  <p className="eyebrow justify-center">About the assessment</p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
                    Frequently Asked Questions
                  </h2>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="mx-auto mt-10 max-w-3xl">
                  <FAQAccordion faqs={ASSESSMENT_FAQS} />
                </div>
              </FadeIn>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="bg-navy text-white">
            <div className="container-page section-padding text-center">
              <FadeIn>
                <h2 className="font-display text-3xl font-bold sm:text-4xl text-balance">
                  Ready to See Where You Stand?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-100">
                  It takes less than 5 minutes — and could save you from a DoL fine,
                  a failed audit, or a workplace incident.
                </p>
                <div className="mt-8 flex justify-center">
                  <a
                    href={SITE.assessmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !px-10 !py-5 text-lg"
                  >
                    Take the Free Assessment Now
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
                <p className="mt-6 text-sm text-navy-300">{SITE.domain}</p>
              </FadeIn>
            </div>
          </section>
        </main>
        <WhatsAppFloat />
    </>
  );
}
