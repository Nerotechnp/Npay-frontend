import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

export function Cta() {
  return (
    <section className="px-4 py-16 sm:px-5 sm:py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-moss to-moss2 px-6 py-14 text-center shadow-xl shadow-moss/20 sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />

        <div className="relative">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
            <Heart className="h-4 w-4" /> Support home, from anywhere
          </span>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to send support back home?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Join Nepalis around the world who pay bills in Nepal in minutes — no
            queues, no hassle.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-moss shadow-lg transition-all hover:-translate-y-0.5 hover:bg-paper hover:shadow-xl sm:w-auto"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#services"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15 sm:w-auto"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
