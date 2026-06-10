import type { Metadata } from "next";
import { ArrowRight, Mail, MapPin, MessageCircle } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import ContactForm from "@/components/ContactForm";
import { SITE, getWhatsAppLink } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact VDW Health & Safety Solutions",
  description:
    "Get in touch with VDW Health & Safety Solutions — OHS compliance consultants serving Gauteng & Limpopo. Chat on WhatsApp or send us a message.",
};

export default function ContactPage() {
  return (
    <section className="bg-white">
      <div className="container-page section-padding">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow justify-center">Get in touch</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-navy sm:text-5xl text-balance">
              Let&apos;s Talk About Your Compliance Position
            </h1>
            <p className="mt-4 text-lg text-navy-600">
              The fastest way to get answers is a quick WhatsApp message. Prefer to
              write it all out? Use the form below and we&apos;ll get back to you.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <FadeIn>
              <div className="rounded-2xl bg-navy p-6 text-white shadow-card sm:p-8">
                <h2 className="font-display text-xl font-bold">
                  Prefer to chat now?
                </h2>
                <p className="mt-2 text-sm text-navy-100">
                  Message us directly on WhatsApp — ideal for quick questions about
                  your compliance situation.
                </p>
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-5 w-full">
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </div>

              <div className="mt-6 rounded-2xl border border-navy-100 bg-offwhite p-6 shadow-card sm:p-8">
                <h2 className="font-display text-xl font-bold text-navy">
                  Not ready to talk yet?
                </h2>
                <p className="mt-2 text-sm text-navy-600">
                  Take our free, no-obligation compliance assessment first — it takes
                  less than 5 minutes.
                </p>
                <a href={SITE.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full">
                  Get My Free Compliance Assessment
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-navy-600">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                  Serving {SITE.region} — on-site &amp; remote support
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
                  <a href={`mailto:${SITE.email}`} className="hover:text-orange">
                    {SITE.email}
                  </a>
                </li>
              </ul>
            </FadeIn>
          </div>

          <div className="lg:col-span-7">
            <FadeIn delay={0.1}>
              <ContactForm />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
