"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQ = { question: string; answer: string };

export default function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white shadow-card">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-navy">{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-orange transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-navy-600 sm:px-6">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
