import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, Phone, Wifi, Zap, ShieldCheck, Plane } from "lucide-react";
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

const quickActions = [
  { icon: Phone, label: "Top-up" },
  { icon: Wifi, label: "Data" },
  { icon: Zap, label: "NEA Bill" },
];

const recentActivity = [
  { name: "NTC Top-up", detail: "Prepaid · 9841******", amount: "Rs 500", status: "Done", tone: "text-green-600" },
  { name: "Data Pack", detail: "Ncell · 10GB", amount: "Rs 999", status: "Done", tone: "text-green-600" },
  { name: "NEA Bill", detail: "Electricity", amount: "Rs 1,240", status: "Done", tone: "text-green-600" },
];

export function Hero() {
  return (
    <section className="relative -mt-16 overflow-hidden bg-gradient-to-b from-moss/[0.05] via-moss/[0.02] to-paper">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-moss/[0.08] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-saffron/[0.10] blur-[100px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-5 sm:pb-20 sm:pt-28 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-moss/20 bg-moss/[0.07] px-4 py-2">
              <Plane className="h-3.5 w-3.5 text-moss" />
              <span className="text-sm font-medium text-moss">
                For Nepalis abroad, paying home
              </span>
            </div>

            <h1 className="mb-6 text-[2.25rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Pay bills in Nepal
              <br className="hidden sm:block" /> from{" "}
              <span className="bg-gradient-to-r from-moss to-moss2 bg-clip-text text-transparent">
                anywhere
              </span>
            </h1>

            <p className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-ink-3 sm:text-lg lg:mx-0">
              Recharge phones, pay NEA and utility bills, and top up data packs
              back home — in any currency, from any country. Simple, fast, and
              built for the Nepali diaspora.
            </p>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start sm:gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full gap-2 rounded-full px-7 shadow-lg shadow-moss/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-moss/30 sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#services" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full rounded-full px-7 transition-all hover:-translate-y-0.5 sm:w-auto"
                >
                  Explore Services
                </Button>
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
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

          <div className="relative mx-auto mt-12 w-full max-w-sm lg:mt-0 lg:max-w-none">
            <div className="relative rounded-[2rem] border border-line-2 bg-white p-3 shadow-2xl shadow-moss/10">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-moss to-moss2 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Namaste, Ram</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> Secured
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {quickActions.map((action) => (
                    <div
                      key={action.label}
                      className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 py-3 backdrop-blur"
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-3 pb-3 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Recent activity
                </p>
                <div className="space-y-2">
                  {recentActivity.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{item.name}</p>
                        <p className="text-xs text-ink-3">{item.detail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink">{item.amount}</p>
                        <p className={`text-xs font-medium ${item.tone}`}>
                          {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -top-10 -right-2 flex items-center gap-2 rounded-2xl border border-line-2 bg-white px-4 py-3 shadow-xl sm:-right-4 sm:-top-12">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-ink">Payment done</p>
                <p className="text-xs text-ink-3">in under 2 seconds</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-2xl">
          <div className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white/70 px-4 py-6 shadow-sm backdrop-blur">
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
