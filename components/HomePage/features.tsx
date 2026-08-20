import { Shield, Zap, Globe, BarChart3, RefreshCw, Headphones } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const features = [
  {
    icon: Zap,
    title: "Instant Transactions",
    description:
      "Recharges and bill payments process in under 2 seconds. No delays, no waiting on family.",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "Every transaction is encrypted end-to-end. One-time email codes keep your account safe.",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description:
      "Pay in USD, AUD, GBP, CAD, EUR and more. We convert to NPR at a transparent, server-set rate.",
  },
  {
    icon: BarChart3,
    title: "Clean Dashboard",
    description:
      "Track every payment, status, and receipt from a simple dashboard — anytime, anywhere.",
  },
  {
    icon: RefreshCw,
    title: "Auto Carrier Detection",
    description:
      "Type a phone number and we detect NTC or Ncell automatically. Fewer mistakes, faster checkout.",
  },
  {
    icon: Headphones,
    title: "Friendly Support",
    description:
      "Questions about a payment? Our team is here to help you look after the people back home.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-moss">
            Why Npay
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Built for the Nepali Diaspora
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-3 sm:text-lg">
            Reliable, secure, and simple — so sending support home is never a
            hassle.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 100}>
              <div className="group h-full rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-moss/25 hover:shadow-lg hover:shadow-moss/5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-moss/10 transition-colors group-hover:bg-moss/15">
                  <feature.icon size={22} className="text-moss" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-3">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
