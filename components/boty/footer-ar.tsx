"use client"

import Link from "next/link"
import { Instagram, Facebook, Twitter } from "lucide-react"
import { FaTiktok } from "react-icons/fa";

const footerLinks = {
  shop: [
    { name: "جميع منتجاتنا", href: "/shop/Ar" },
    { name: "تونر بادس", href: "/shop/Ar" },
    { name: "محيط العين", href: "/shop/Ar" },
    { name: "الأقنعة", href: "/shop/Ar" },
  ],
  about: [
    { name: "قصتنا", href: "/shop/Ar" },
    { name: "المكونات", href: "/shop/Ar" },
    { name: "الاستدامة", href: "/shop/Ar" },
    { name: "الصحافة", href: "/shop/Ar" }
  ],
  support: [
    { name: "اتصل بنا", href: "/shop/Ar" },
    { name: "الأسئلة الشائعة", href: "/shop/Ar" },
    { name: "الشحن", href: "/shop/Ar" },
  ]
}

export function FooterAr() {
  return (
    <footer dir="rtl" className="bg-card pt-20 pb-10 relative overflow-hidden">
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
            <h2 className="font-cairo text-3xl text-foreground mb-4 font-semibold">Gateline Cosmetics</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-cairo">
              للتجربة أفضل، جربه.
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
            <h3 className="font-cairo font-medium text-foreground mb-4">المتجر</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition font-cairo"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-cairo font-medium text-foreground mb-4">من نحن</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition font-cairo"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-cairo font-medium text-foreground mb-4">الدعم</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition font-cairo"
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
            <p className="text-sm text-muted-foreground font-cairo">
              © 2025 Gateline Cosmetics. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6">
              <Link href="/shop/Ar" className="text-sm text-muted-foreground hover:text-foreground boty-transition font-cairo">
                سياسة الخصوصية
              </Link>
              <Link href="/shop/Ar" className="text-sm text-muted-foreground hover:text-foreground boty-transition font-cairo">
                شروط الخدمة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
