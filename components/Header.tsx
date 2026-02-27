"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Zap, Search, Menu, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("nav");
  const tSearch = useTranslations("search");
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const otherLocale = locale === "ko" ? "en" : "ko";
  // Swap locale in current path
  const switchPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(() => {
      router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
    });
  }

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/artists`, label: t("artists") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="hidden sm:block text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TenAsia Fan
          </span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === href || (href !== `/${locale}` && pathname.startsWith(href))
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-sm ml-auto">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tSearch("placeholder")}
              className="pl-8 h-8 text-xs bg-muted border-0 focus-visible:ring-1"
            />
          </div>
        </form>

        {/* Language switcher */}
        <Link
          href={switchPath}
          className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
        >
          {otherLocale.toUpperCase()}
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden shrink-0"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border/60 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                pathname === href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
