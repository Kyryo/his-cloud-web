"use client";

import { Globe, Mail, Phone } from "lucide-react";
import { FaFacebook, FaGithub, FaTwitter } from "react-icons/fa";

export function Footer() {
  const quickLinks = ["Home", "Services", "Contact", "About Us"];
  const socials = [
    { href: "#", icon: <FaFacebook className="h-6 w-6" /> },
    { href: "#", icon: <FaTwitter className="h-6 w-6" /> },
    { href: "#", icon: <FaGithub className="h-6 w-6" /> },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-brand-border bg-brand-navy py-20 text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col justify-between gap-16 md:flex-row">
          <div className="space-y-4 md:w-1/3">
            <h3 className="font-[family-name:var(--font-bricolage)] text-3xl font-extrabold">
              Sigma Health
            </h3>
            <p className="text-lg leading-relaxed text-brand-muted">
              Smarter healthcare solutions for clinics and hospitals. All tools
              in one modern platform.
            </p>
          </div>

          <div className="space-y-4 md:w-1/3">
            <h3 className="mb-4 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href={`/${link.toLowerCase().replace(" ", "")}`}
                    className="text-lg text-brand-muted transition-colors duration-300 hover:text-brand-sky"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 md:w-1/3">
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

            <div className="mt-6 flex justify-center gap-5 text-xl md:justify-start">
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
          &copy; {new Date().getFullYear()} Healthcare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
