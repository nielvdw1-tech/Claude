import type { Metadata } from "next";
import { ArrowRight, Award, MapPin, ShieldCheck, Users2, FileCheck2 } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "About VDW Health & Safety Solutions",
  description:
    "Meet VDW Health & Safety Solutions — external OHS consultants providing Section 37(2) safety officer agreements and compliance support to Gauteng & Limpopo SMEs.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Practical, not bureaucratic",
    description:
      "We build systems your team will actually use — not binders that sit on a shelf until an inspector asks for them.",
  },
  {
    icon: FileCheck2,
    title: "Built on the law, not guesswork",
    description:
      "Every audit, file, and HIRA is grounded in the OHS Act No. 85 of 1993, COIDA, and relevant regulations — so you know it holds up.",
  },
  {
    icon: Users2,
    title: "A genuine extension of your team",
    description:
      "Under a Section 37(2) agreement, we operate as your accountable safety partner — present, responsive, and invested in your outcomes.",
  },
  {
    icon: Award,
    title: "Sector-focused expertise",
    description:
      "We work specifically with manufacturing, warehousing, and engineering operations — so we understand your hazards, not generic ones.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-navy text-white">
        <div className="container-page section-padding">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow">About VDW Health &amp; Safety Solutions</p>
              <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl text-balance">
                Your External Safety Partner — Not Just Another Service Provider
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-navy-100">
                VDW Health &amp; Safety Solutions was founded to give manufacturing,
                warehousing, and engineering SMEs across Gauteng and Limpopo access to
                proper, accountable OHS expertise — without the cost of a full-time
                safety department. Led by Niel van der Westhuizen, we operate as
                appointed external consultants under formal Section 37(2) agreements,
                meaning we take on real, documented responsibility for your safety
                compliance — not just advice from the sidelines.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href={SITE.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Get My Free Compliance Assessment
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <FadeIn>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-sm sm:p-8">
                  <h2 className="font-display text-xl font-bold">At a glance</h2>
                  <ul className="mt-5 space-y-4 text-sm text-navy-100">
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                      External OHS consultant operating under Section 37(2) agreements
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                      Serving SMEs across Gauteng and Limpopo
                    </li>
                    <li className="flex items-start gap-3">
                      <Award className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                      Focused on manufacturing, warehousing &amp; engineering
                    </li>
                    <li className="flex items-start gap-3">
                      <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                      Compliance built on the OHS Act No. 85 of 1993, COIDA &amp; ISO 45001
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow justify-center">Why SMEs choose us</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
                Compliance That Actually Works on Your Floor
              </h2>
              <p className="mt-4 text-lg text-navy-600">
                We&apos;ve seen too many SMEs pay for an H&amp;S file that looks correct on
                paper but means nothing on the ground. Our approach starts with how
                your business actually operates — then builds the legal and practical
                framework around it.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <FadeIn key={value.title} delay={(index % 2) * 0.1}>
                  <div className="flex h-full gap-4 rounded-2xl border border-navy-100 bg-offwhite p-6 shadow-card sm:p-8">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange/10">
                      <Icon className="h-6 w-6 text-orange" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-navy">
                        {value.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-navy-600">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 37(2) EXPLAINER */}
      <section className="section-padding bg-navy-50">
        <div className="container-page">
          <FadeIn>
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="eyebrow">The legal framework</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl text-balance">
                  What a Section 37(2) Agreement Means For You
                </h2>
                <p className="mt-4 text-base leading-relaxed text-navy-600">
                  Section 37(2) of the OHS Act No. 85 of 1993 allows an employer to
                  enter into a written agreement with a contractor — like VDW — to
                  take over specific health and safety duties. This isn&apos;t a
                  marketing term; it&apos;s a formal legal mechanism that creates
                  documented, shared accountability for compliance.
                </p>
                <p className="mt-4 text-base leading-relaxed text-navy-600">
                  For your business, this means you get a named, qualified external
                  party responsible for defined safety functions — visible to
                  inspectors, auditors, and your own management — without carrying
                  that role as a full-time internal position.
                </p>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
                  <h3 className="font-display text-lg font-bold text-navy">
                    Industries we serve
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-navy-600">
                    <li className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-orange" /> Manufacturing
                      &amp; production facilities
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-orange" /> Warehousing
                      &amp; distribution centres
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-orange" /> Engineering
                      &amp; fabrication workshops
                    </li>
                  </ul>
                  <div className="mt-6 border-t border-navy-100 pt-6">
                    <p className="text-sm font-semibold text-navy">Coverage area</p>
                    <p className="mt-1 text-sm text-navy-600">
                      Gauteng &amp; Limpopo — on-site visits and remote support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy text-white">
        <div className="container-page section-padding text-center">
          <FadeIn>
            <h2 className="font-display text-3xl font-bold sm:text-4xl text-balance">
              Ready to See Where Your Business Stands?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-100">
              Take our free compliance assessment — it takes less than 5 minutes and
              requires no commitment.
            </p>
            <div className="mt-8 flex justify-center">
              <a href={SITE.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Get My Free Compliance Assessment
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
