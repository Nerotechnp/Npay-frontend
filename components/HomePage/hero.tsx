import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

const trustPoints = [
  "Pay in any currency",
  "Instant processing",
  "Bank-grade security",
];

const stats = [
  { value: "24/7", label: "Service" },
  { value: "<2s", label: "Avg. Processing" },
  { value: "100%", label: "Nepal-focused" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-moss/[0.04] via-moss/[0.02] to-paper">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-moss/[0.06] blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-moss/[0.04] blur-[80px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pb-20 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-moss/20 bg-moss/[0.07] px-4 py-2">
            <Globe className="h-3.5 w-3.5 text-moss" />
            <span className="text-sm font-medium text-moss">
              For Nepalis abroad, paying home
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Pay bills in Nepal
            <br className="hidden sm:block" /> from <span className="text-moss">anywhere</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-ink-3 sm:text-lg">
            Recharge phones, pay NEA and utility bills, and top up data packs
            back home — in any currency, from any country. Simple, fast, and
            built for the Nepali diaspora.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/login">
              <Button
                size="lg"
                className="gap-2 rounded-full px-7 shadow-md shadow-moss/20 transition-shadow hover:shadow-lg hover:shadow-moss/25"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#services">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full px-7"
              >
                Explore Services
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-1.5 text-sm text-ink-3"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-lg">
          <div className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white px-4 py-7 shadow-sm">
            {stats.map((stat) => (
              <div key={stat.label} className="px-2 text-center">
                <div className="text-2xl font-bold text-ink sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-ink-3 sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
