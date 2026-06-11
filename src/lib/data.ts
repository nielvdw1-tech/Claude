import {
  ClipboardCheck,
  FolderCheck,
  ShieldAlert,
  UserCheck,
  GraduationCap,
  Gift,
  ShieldCheck,
  Award,
  type LucideIcon,
} from "lucide-react";

export const SITE = {
  name: "VDW Health & Safety Solutions",
  shortName: "VDW Safety",
  domain: "vdwsafety.com",
  assessmentUrl: "https://vdwassessment.zite.so",
  whatsappNumber: "27821234567", // placeholder — replace with real WhatsApp number
  whatsappMessage:
    "Hi VDW Health & Safety Solutions, I'd like to find out more about getting my business compliant.",
  email: "info@vdwsafety.com",
  region: "Gauteng & Limpopo",
};

export function getWhatsAppLink(message?: string) {
  const text = encodeURIComponent(message ?? SITE.whatsappMessage);
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export type Service = {
  slug: string;
  icon: LucideIcon;
  name: string;
  shortBenefit: string;
  description: string;
  deliverables: string[];
  whoFor: string;
  legislation: string;
};

export const SERVICES: Service[] = [
  {
    slug: "compliance-audits",
    icon: ClipboardCheck,
    name: "Compliance Audits & Gap Analyses",
    shortBenefit:
      "Know exactly where your business stands before a DoL inspector tells you the hard way.",
    description:
      "We conduct an on-site audit of your current health and safety practices, documentation, and physical workplace conditions, benchmarked against the OHS Act and applicable regulations. You'll receive a clear, prioritised gap report — not a generic checklist — so you know exactly what to fix first, what's a legal red flag, and what can wait. This is the foundation every compliant H&S system is built on.",
    deliverables: [
      "Full on-site walkthrough audit of your premises and operations",
      "Documented gap analysis scored against OHS Act requirements",
      "Prioritised action plan ranked by legal risk and urgency",
      "Photographic evidence log of identified hazards and gaps",
      "Executive summary report for management and directors",
    ],
    whoFor:
      "Business owners and operations managers in manufacturing, warehousing, and engineering who need an honest picture of their compliance exposure — especially before a client audit, DoL inspection, or new contract tender.",
    legislation:
      "Required to demonstrate due diligence under Section 8 of the OHS Act No. 85 of 1993 (general duties of employers).",
  },
  {
    slug: "hs-file-builds",
    icon: FolderCheck,
    name: "H&S File Builds",
    shortBenefit:
      "A complete, audit-ready health & safety file — built once, maintained properly, never scrambled together again.",
    description:
      "Most SMEs we meet have an H&S file that's outdated, incomplete, or copy-pasted from a template that doesn't match their operation. We build yours from scratch — structured around your actual site, your actual risks, and your actual legal appointments. The result is a file that holds up under DoL inspection, client audits, and contractor pre-qualification reviews, organised so anyone in your business can find what's needed in seconds.",
    deliverables: [
      "Complete legal appointments register (Section 16.2, 8.2, first aiders, fire marshals, etc.)",
      "Site-specific policies and procedures aligned to your operations",
      "Up to 26 standard operating procedures (SOPs) tailored to your processes",
      "Incident reporting registers and COIDA documentation templates",
      "Inspection checklists and recordkeeping templates ('golden thread' evidence)",
      "Digital and printed file structure, ready for audit",
    ],
    whoFor:
      "SMEs that need a defensible, organised H&S file for DoL compliance, ISO 45001 readiness, or to satisfy client/contractor due diligence requirements.",
    legislation:
      "Maintains the documented 'golden thread' of compliance required under the OHS Act No. 85 of 1993 and supports COIDA reporting obligations.",
  },
  {
    slug: "hira",
    icon: ShieldAlert,
    name: "HIRA — Hazard Identification & Risk Assessment",
    shortBenefit:
      "Identify what could hurt your people or shut down your site — before it happens, not after.",
    description:
      "A proper HIRA isn't a once-off form — it's a working risk management tool specific to each area of your operation. We walk every work area with your team, identify hazards specific to your machinery, processes, and layout, and produce risk assessments with practical, implementable control measures. This isn't theory: it's the document your safety officer, supervisors, and DoL inspector will actually use.",
    deliverables: [
      "Baseline risk assessment covering your full site",
      "Task-specific HIRA per work area or process line",
      "Risk rating matrix with likelihood and severity scoring",
      "Practical control measures ranked by the hierarchy of controls",
      "Action register with owners and target dates",
      "Annual review schedule to keep assessments current",
    ],
    whoFor:
      "Manufacturing, warehousing, and engineering operations with machinery, manual handling, chemical exposure, working-at-height, or other significant operational hazards.",
    legislation:
      "A legal requirement under Section 8 of the OHS Act No. 85 of 1993, and a foundational requirement of ISO 45001 risk management frameworks.",
  },
  {
    slug: "outsourced-safety-officer",
    icon: UserCheck,
    name: "Outsourced Safety Officer Management",
    shortBenefit:
      "Get the expertise of a qualified safety officer without the cost of a full-time salary.",
    description:
      "For most SMEs, a full-time safety officer doesn't make financial sense — but having no one accountable for OHS is a serious liability. Under a Section 37(2) agreement, we act as your appointed external safety resource: conducting scheduled site visits, managing your compliance calendar, running toolbox talks, and ensuring your H&S system stays current and functional between visits — not just on paper.",
    deliverables: [
      "Section 37(2) agreement formalising the appointment and shared liability arrangement",
      "Scheduled monthly or bi-weekly site visits and inspections",
      "Ongoing maintenance of your H&S file and registers",
      "Toolbox talks and safety briefings for your team",
      "Incident investigation support and reporting",
      "Direct point of contact for DoL queries and audits",
    ],
    whoFor:
      "SME operations that need ongoing, accountable safety management but don't have the scale (or budget) to justify an in-house safety officer.",
    legislation:
      "Formalised through a Section 37(2) agreement under the OHS Act No. 85 of 1993, which governs arrangements between employers and contracted persons regarding shared duties.",
  },
  {
    slug: "training",
    icon: GraduationCap,
    name: "Training",
    shortBenefit:
      "Equip your team with the legally required knowledge to work safely — and prove it on paper.",
    description:
      "Untrained staff are both a safety risk and a compliance gap. We deliver practical, on-site training tailored to your operation — from legal appointee inductions to general health and safety awareness — so your team understands not just what the rules are, but why they matter on your floor. Every session is documented, giving you the proof of competency records that audits require.",
    deliverables: [
      "Legal appointee training (Section 16.2, 8.2, fire marshals, first aiders)",
      "General health & safety induction for new and existing staff",
      "Hazard-specific training (manual handling, working at heights, chemical handling)",
      "HIRA awareness and toolbox talk training",
      "Attendance registers and certificates of competency",
      "Refresher training scheduling aligned to legal requirements",
    ],
    whoFor:
      "Manufacturing, warehousing, and engineering businesses that need to demonstrate competency training for legal appointees and general staff.",
    legislation:
      "Supports compliance with training and competency obligations under the OHS Act No. 85 of 1993 and relevant Construction Regulations, 2014, where applicable.",
  },
];

export const PROCESS_STEPS = [
  {
    number: "01",
    title: "Free Compliance Assessment",
    description:
      "Take our 5-minute online assessment to get an instant snapshot of your current OHS compliance status and biggest risk areas.",
  },
  {
    number: "02",
    title: "Custom Compliance Plan",
    description:
      "We review your results and your operation, then put together a clear, prioritised plan — what needs fixing, in what order, and what it involves.",
  },
  {
    number: "03",
    title: "Implementation & Ongoing Support",
    description:
      "We build your H&S file, run your audits and HIRAs, and provide ongoing safety officer support so compliance stays current — not a once-off project.",
  },
];

export const RISKS = [
  {
    title: "DoL Inspection Risk",
    description:
      "Unannounced Department of Labour inspections can halt operations on the spot if your H&S file, appointments, or registers aren't in order.",
  },
  {
    title: "Section 8 Legal Exposure",
    description:
      "As an employer, Section 8 of the OHS Act places a personal duty of care on you and your management — ignorance is not a legal defence.",
  },
  {
    title: "COIDA & Incident Costs",
    description:
      "Workplace incidents trigger COIDA claims, investigations, and potential downtime — costs that compound fast without proper risk controls in place.",
  },
];

export const HOMEPAGE_FAQS = [
  {
    question: "How much does this cost — is it affordable for an SME?",
    answer:
      "Our services are scoped around your business size and risk profile, not a one-size-fits-all retainer. Many SMEs find that a structured compliance programme costs significantly less than a single DoL fine, lost contract, or COIDA claim. We'll give you a clear, itemised quote after your free assessment — no surprises.",
  },
  {
    question: "Do I really need this if I haven't had any issues so far?",
    answer:
      "Section 8 of the OHS Act No. 85 of 1993 places a legal duty on employers regardless of whether an incident has occurred. DoL inspections are increasingly common across Gauteng and Limpopo industrial areas, and many client and contractor agreements now require proof of compliance before work can proceed. Waiting until there's a problem is the most expensive way to become compliant.",
  },
  {
    question: "What exactly do I get — is this just paperwork?",
    answer:
      "No. While documentation (your H&S file, HIRAs, registers) is part of what's required by law, our focus is on practical, working systems — risk assessments your supervisors actually use, training your team understands, and a safety officer relationship that keeps things current. The paperwork is the evidence of a system that actually functions.",
  },
  {
    question: "What legislation does this cover?",
    answer:
      "Our work is built around the OHS Act No. 85 of 1993 (including Sections 8, 16.2, and 37(2) appointments), the Compensation for Occupational Injuries and Diseases Act (COIDA), the Construction Regulations, 2014 where applicable, and aligns with ISO 45001 occupational health and safety management principles.",
  },
  {
    question: "What happens after I complete the free assessment?",
    answer:
      "Nothing pushy. Your results give you an immediate snapshot of where your business stands. If you'd like to discuss your results or next steps, you can message us on WhatsApp or request a callback — there's no obligation and no automatic sales call.",
  },
  {
    question: "Which industries and areas do you serve?",
    answer:
      "We work primarily with manufacturing, warehousing, and engineering SMEs across Gauteng and Limpopo, providing both on-site visits and remote support depending on your location and needs.",
  },
];

export const ASSESSMENT_FAQS = [
  {
    question: "How long does the assessment take?",
    answer:
      "About 5 minutes. It's a short series of questions about your current safety appointments, documentation, and workplace practices.",
  },
  {
    question: "Will I be pressured into buying something afterwards?",
    answer:
      "No. The assessment is a free diagnostic tool. You'll get your results immediately, and there's no automatic sales call or obligation to engage our services.",
  },
  {
    question: "Is this assessment specific to my industry?",
    answer:
      "The assessment is built around the OHS Act No. 85 of 1993 framework that applies to all employers, with particular relevance to manufacturing, warehousing, and engineering operations — the sectors we specialise in.",
  },
];

export const SERVICES_FAQS = [
  {
    question: "Can I order just one service, like a HIRA, on its own?",
    answer:
      "Yes. While most clients start with a compliance audit to understand the full picture, each service can be scoped and delivered independently based on your immediate priority.",
  },
  {
    question: "How long does an H&S file build take?",
    answer:
      "Depending on the size and complexity of your site, a full H&S file build typically takes between 2 and 6 weeks from the completion of your audit and HIRA.",
  },
  {
    question: "Do you work with businesses outside Gauteng and Limpopo?",
    answer:
      "Our on-site services are focused on Gauteng and Limpopo, but remote consulting, document development, and training support can be arranged for businesses elsewhere — get in touch to discuss.",
  },
  {
    question: "What is a Section 37(2) agreement and do I need one?",
    answer:
      "Section 37(2) of the OHS Act allows an employer to enter into a written agreement with a contractor (such as VDW) to take over certain health and safety duties. It's the legal mechanism that underpins our outsourced safety officer service, giving you documented accountability without employing staff directly.",
  },
];

export type LadderTier = {
  tier: string;
  icon: LucideIcon;
  badge: string;
  badgeStyle: "free" | "popular" | "premium";
  headline: string;
  subheadline?: string;
  description: string;
  price?: string;
  features: string[];
  cta: {
    label: string;
    type: "assessment" | "whatsapp";
  };
};

export const COMPLIANCE_LADDER: LadderTier[] = [
  {
    tier: "Step 1",
    icon: Gift,
    badge: "FREE — No obligation",
    badgeStyle: "free",
    headline: "Free OHS Compliance Health Check",
    description:
      "A 30–45 minute assessment that scores your current compliance posture across 10 critical areas and gives you a written Compliance Gap Report showing your top 3 legal exposure points — at no cost.",
    features: [
      "Scored across 10 critical OHS compliance areas",
      "Written Compliance Gap Report",
      "Your top 3 legal exposure points, identified",
      "No cost, no obligation, no sales call",
    ],
    cta: { label: "Get My Free Assessment", type: "assessment" },
  },
  {
    tier: "Step 2",
    icon: ShieldCheck,
    badge: "Most Popular",
    badgeStyle: "popular",
    headline: "OHS Compliance Audit & Safety File Build",
    subheadline: "Audit-ready in 10 working days. DoL-proof. Guaranteed.",
    description:
      "We build your complete H&S compliance system from scratch — legal appointments, full HIRA set, SOPs, emergency plan, safety file, and Section 37(2) agreement. Includes a DoL Inspection Response Guide and a 12-month Guarantee.",
    price: "From R18,500",
    features: [
      "Full legal appointments register (16.2, 8.2 & more)",
      "Complete HIRA set for every work area",
      "SOPs, emergency plan & audit-ready safety file",
      "Section 37(2) agreement included",
      "DoL Inspection Response Guide",
      "12-month compliance guarantee",
    ],
    cta: { label: "Request a Quote", type: "whatsapp" },
  },
  {
    tier: "Step 3",
    icon: Award,
    badge: "Best Value",
    badgeStyle: "premium",
    headline: "Outsourced Safety Officer — Monthly Compliance Management",
    subheadline: "Your dedicated external safety officer. Every month. Guaranteed.",
    description:
      "Monthly site visits, compliance reports, toolbox talks, training register monitoring, DoL inspection support, and on-call WhatsApp access. We manage your compliance so you never have to think about it again.",
    price: "From R4,500/month",
    features: [
      "Monthly site visits & compliance reports",
      "Toolbox talks & training register monitoring",
      "DoL inspection support, on demand",
      "On-call WhatsApp access to your safety officer",
      "Section 37(2) agreement maintained & managed",
    ],
    cta: { label: "Request a Quote", type: "whatsapp" },
  },
];
