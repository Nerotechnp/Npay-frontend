import { ChevronDown } from "lucide-react";

const FAQ_DATA = [
  {
    question: "What is Npay?",
    answer:
      "Npay is a payment platform for Nepalis living abroad. It lets you recharge phones, buy data packs, and pay utility bills in Nepal — using any supported foreign currency.",
  },
  {
    question: "Who is Npay for?",
    answer:
      "Any Nepali living outside Nepal who wants to support family and home — top-ups, data packs, and bills paid in minutes from your phone or laptop.",
  },
  {
    question: "Which currencies can I pay with?",
    answer:
      "We support USD, AUD, GBP, CAD, and EUR today, with more being added. You always see the exact NPR amount before you confirm.",
  },
  {
    question: "How do I get started?",
    answer:
      "Click Get Started, log in with your email (we send a one-time code — no password to remember), and you're ready to pay.",
  },
  {
    question: "Which services can I pay for?",
    answer:
      "Mobile top-ups and data/SMS packs for major Nepal networks, plus utility and NEA electricity bill payments. More services are on the way.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Yes. All transactions are encrypted, and account access uses one-time email verification codes. We never store your card details.",
  },
  {
    question: "How fast is a top-up or bill payment?",
    answer:
      "Most payments process in under two seconds. You get a receipt as soon as the transaction is confirmed.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-moss">
            FAQ
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-3">
            Everything you need to know about Npay.
          </p>
        </div>

        <div className="w-full space-y-3">
          {FAQ_DATA.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-line bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-base font-semibold text-ink">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-ink-3">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
