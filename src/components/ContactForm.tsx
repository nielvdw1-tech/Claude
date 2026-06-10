"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-card">
        <h3 className="font-display text-xl font-bold text-navy">Thanks — message received</h3>
        <p className="mt-2 text-sm text-navy-600">
          We&apos;ll be in touch shortly. If it&apos;s urgent, message us directly on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-navy">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-2 block w-full rounded-lg border border-navy-100 px-4 py-3 text-sm text-ink shadow-sm focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-semibold text-navy">
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            className="mt-2 block w-full rounded-lg border border-navy-100 px-4 py-3 text-sm text-ink shadow-sm focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
            placeholder="Your company name"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-navy">
            Phone / WhatsApp number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-2 block w-full rounded-lg border border-navy-100 px-4 py-3 text-sm text-ink shadow-sm focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
            placeholder="082 123 4567"
          />
        </div>
        <div>
          <label htmlFor="concern" className="block text-sm font-semibold text-navy">
            What&apos;s your biggest compliance concern?
          </label>
          <textarea
            id="concern"
            name="concern"
            rows={4}
            required
            className="mt-2 block w-full rounded-lg border border-navy-100 px-4 py-3 text-sm text-ink shadow-sm focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
            placeholder="e.g. We've never had a formal H&S audit and aren't sure what's missing"
          />
        </div>
      </div>
      <button type="submit" className="btn-primary mt-6 w-full">
        Send My Message
        <ArrowRight className="h-5 w-5" />
      </button>
    </form>
  );
}
