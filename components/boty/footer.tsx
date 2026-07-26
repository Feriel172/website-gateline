"use client"

import Link from "next/link"
import { Instagram, Facebook, Twitter } from "lucide-react"
import { FaTiktok } from "react-icons/fa";

const footerLinks = {
  shop: [
    { name: "Tous Nos Produits", href: "/shop" },
    { name: "Toner pads", href: "/shop?category=tonerpads" },
    { name: "Contour des yeux", href: "/shop?category=contourdesyeux" },
    { name: "Masques", href: "/shop?category=masques" },
  ],
  about: [
    { name: "Our Story", href: "/" },
    { name: "Ingredients", href: "/" },
    { name: "Sustainability", href: "/" },
    { name: "Press", href: "/" }
  ],
  support: [
    { name: "Contact Us", href: "/" },
    { name: "FAQ", href: "/" },
    { name: "Shipping", href: "/" },
  ]
}

export function Footer() {
  return (
    <footer className="bg-card pt-20 pb-10 relative overflow-hidden">
      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="font-serif text-[200px] sm:text-[200px] md:text-[400px] lg:text-[400px] xl:text-[400px] font-bold text-white/20 whitespace-nowrap leading-none">
          Gateline Cosmetics
        </span>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="font-serif text-3xl text-foreground mb-4">Gateline Cosmetics</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              le tester c'est l'adopter. 
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/gateline_cosmetics/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100094099140322"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@gatelinecosmetics"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="TikTok"
              >
                <FaTiktok className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Gateline Cosmetics. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Privacy Policy
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
