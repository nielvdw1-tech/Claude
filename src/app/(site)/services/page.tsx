import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Gavel, Users } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import FAQAccordion from "@/components/FAQAccordion";
import { SITE, SERVICES, SERVICES_FAQS } from "@/lib/data";

export const metadata: Metadata = {
  title: "OHS Compliance Services for Manufacturing, Warehousing & Engineering",
  description:
    "Compliance audits, H&S file builds, HIRA, outsourced safety officer management, and training — for manufacturing, warehousing, and engineering SMEs in Gauteng and Limpopo.",
};

export default function ServicesPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-navy text-white">
        <div className="container-page section-padding text-center">
          <p className="eyebrow justify-center">Our services</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl text-balance">
            Stop Paying for Compliance Gaps
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-100">
            Five focused services — built around the OHS Act No. 85 of 1993 — that
            close your compliance gaps and keep them closed, without the cost of
            building an in-house safety department.
          </p>
          <div className="mt-8 flex justify-center">
            <a href={SITE.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Get My Free Compliance Assessment
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES DETAIL */}
      {SERVICES.map((service, index) => {
        const Icon = service.icon;
        const isAlt = index % 2 === 1;
        return (
          <section
            key={service.slug}
            id={service.slug}
            className={`section-padding scroll-mt-20 ${isAlt ? "bg-navy-50" : "bg-white"}`}
          >
            <div className="container-page">
              <FadeIn>
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                  <div className="lg:col-span-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange/10">
                      <Icon className="h-6 w-6 text-orange" />
                    </div>
                    <h2 className="mt-5 font-display text-3xl font-bold text-navy text-balance">
                      {service.name}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-navy-600">
                      {service.description}
                    </p>

                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-4">
                      <Users className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                      <div>
                        <p className="text-sm font-semibold text-navy">Who it&apos;s for</p>
                        <p className="mt-1 text-sm text-navy-600">{service.whoFor}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-4">
                      <Gavel className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                      <div>
                        <p className="text-sm font-semibold text-navy">Relevant legislation</p>
                        <p className="mt-1 text-sm text-navy-600">{service.legislation}</p>
                      </div>
                    </div>

                    <a
                      href={SITE.assessmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary mt-8"
                    >
                      Get a Free Assessment to See If You Need This
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
                      <h3 className="font-display text-lg font-bold text-navy">
                        What you get
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {service.deliverables.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm text-navy-600">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>
        );
      })}

      {/* FAQ */}
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
              <FAQAccordion faqs={SERVICES_FAQS} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-navy text-white">
        <div className="container-page section-padding text-center">
          <FadeIn>
            <h2 className="font-display text-3xl font-bold sm:text-4xl text-balance">
              Not Sure Which Service You Need?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-100">
              Take our free 5-minute compliance assessment and we&apos;ll point you to
              exactly the right starting point.
            </p>
            <div className="mt-8 flex justify-center">
              <a href={SITE.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Take the Free Assessment
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
