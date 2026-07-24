"use client";

import { Globe, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { FaFacebook, FaGithub, FaTwitter } from "react-icons/fa";

import { ROUTES } from "@/constants/routes";

export function Footer() {
  const quickLinks = [
    { label: "Home", href: ROUTES.home },
    { label: "Company", href: ROUTES.company },
    { label: "Services", href: ROUTES.services },
    { label: "Contact", href: ROUTES.contacts },
  ];
  const legalLinks = [
    { label: "Privacy Policy", href: ROUTES.privacy },
    { label: "Terms of Service", href: ROUTES.terms },
  ];
  const socials = [
    { href: "#", icon: <FaFacebook className="h-6 w-6" /> },
    { href: "#", icon: <FaTwitter className="h-6 w-6" /> },
    { href: "#", icon: <FaGithub className="h-6 w-6" /> },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-brand-border bg-brand-navy py-20 text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-bricolage)] text-3xl font-extrabold">
              Sigma Health
            </h3>
            <p className="text-lg leading-relaxed text-brand-muted">
              Smarter healthcare solutions for clinics and hospitals. All tools
              in one modern platform.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="mb-4 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-lg text-brand-muted transition-colors duration-300 hover:text-brand-sky"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="mb-4 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-lg text-brand-muted transition-colors duration-300 hover:text-brand-sky"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="mb-4 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold">
              Contact
            </h3>
            <div className="space-y-3 text-lg text-brand-muted">
              <p className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-brand-sky" />
                +123 456 789
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-brand-sky" />
                info@sigmaconnect.org
              </p>
              <p className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-brand-sky" />
                www.sigmaconnect.org
              </p>
            </div>

            <div className="mt-6 flex justify-start gap-5 text-xl">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-brand-muted transition-colors duration-300 hover:text-brand-sky"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-6 text-center text-sm tracking-wide text-brand-muted">
          &copy; {new Date().getFullYear()} Sigma Health. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
