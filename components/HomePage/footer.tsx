import Link from "next/link";
import { Facebook, Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss text-sm font-bold text-white">
                N
              </div>
              <span className="text-lg font-bold text-ink">Npay</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-ink-3">
              Pay bills in Nepal from anywhere. Recharge phones, buy data packs,
              and settle utility bills — in any currency, for the people back
              home.
            </p>
            <div className="mt-4 flex items-center gap-5">
              <a href="#" className="text-ink-3 transition-colors hover:text-moss" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-ink-3 transition-colors hover:text-moss" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href="mailto:info@nepalsewa.com" className="text-ink-3 transition-colors hover:text-moss" aria-label="Email">
                <Mail size={24} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink">
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Mobile Top-up", href: "/login" },
                { label: "Data Packs", href: "/login" },
                { label: "NEA Bill Payment", href: "/login" },
                { label: "Utility Bills", href: "/login" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-3 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink">
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "info@nepalsewa.com", href: "mailto:info@nepalsewa.com" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-3 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-center">
          <p className="text-xs text-ink-3">
            &copy; {new Date().getFullYear()} Npay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
