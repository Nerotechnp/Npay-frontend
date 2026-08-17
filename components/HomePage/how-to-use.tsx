import { LogIn, Wallet, Smartphone, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    icon: LogIn,
    title: "Sign In",
    description:
      "Log in with your email — no password needed, we send a one-time code. Your account is ready in seconds.",
  },
  {
    icon: Smartphone,
    title: "Pick a Service",
    description:
      "Choose top-up, data pack, or a bill. Enter the number or account — we auto-detect the carrier for you.",
  },
  {
    icon: Wallet,
    title: "Pay In Your Currency",
    description:
      "Pay with USD, AUD, GBP, CAD, EUR and more. We show the exact NPR amount before you confirm.",
  },
  {
    icon: CheckCircle2,
    title: "Done Instantly",
    description:
      "We process the payment through our provider and send a receipt. The recharge or bill is settled right away.",
  },
];

export function HowItWorksList() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-moss">
            Getting Started
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            How Npay Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-3">
            Pay a bill back home in four simple steps.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-line-2 to-transparent lg:block"
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 100}>
                <div className="relative flex h-full flex-col items-center text-center">
                  <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line-2 bg-white text-lg font-bold text-moss shadow-sm ring-4 ring-paper">
                    {index + 1}
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border border-line bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full">
                    <step.icon size={22} className="mb-3 text-moss" />
                    <h3 className="mb-2 text-base font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-3">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
