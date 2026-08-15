import { LogIn, Wallet, Smartphone, CheckCircle2 } from "lucide-react";

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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-line bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-moss/10">
                  <step.icon size={20} className="text-moss" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-ink-3">
                  Step {index + 1}
                </span>
              </div>

              <h3 className="mb-2 text-base font-semibold text-ink">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-3">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 hidden h-px w-6 bg-line lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
