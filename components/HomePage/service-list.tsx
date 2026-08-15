import { Smartphone, Zap, Globe } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
  {
    icon: Smartphone,
    title: "Mobile Top-up & Data Packs",
    description:
      "Instantly recharge mobile balances and buy data/SMS packs across NTC, Ncell and more — for family back home.",
    badge: "Most Popular",
    href: "/login",
  },
  {
    icon: Zap,
    title: "Utility & NEA Bills",
    description:
      "Pay electricity and utility bills fast and reliably. No queues, no delays — track dues and clear them in seconds.",
    badge: null,
    href: "/login",
  },
  {
    icon: Globe,
    title: "Pay From Any Currency",
    description:
      "Living abroad? Pay in USD, AUD, GBP, CAD, EUR and more. We handle the conversion at a transparent rate.",
    badge: "For the Diaspora",
    href: "/login",
  },
];

export function ServicesList() {
  return (
    <section id="services" className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-moss">
            What We Offer
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Our Services
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-3 sm:text-lg">
            Everything you need to support family and home back in Nepal — all in
            one place.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative flex flex-col rounded-2xl border border-line bg-white p-7 shadow-sm transition-all hover:border-moss/30 hover:shadow-md"
            >
              {service.badge && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                  {service.badge}
                </span>
              )}

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-moss/10">
                <service.icon size={24} className="text-moss" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-ink">
                {service.title}
              </h3>
              <p className="flex-grow text-sm leading-relaxed text-ink-3">
                {service.description}
              </p>

              <Link
                href={service.href}
                className="mt-5 flex items-center gap-1 text-sm font-medium text-moss opacity-0 transition-opacity group-hover:opacity-100"
              >
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
