"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, User, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Beranda", icon: Home, href: "/" },
    { label: "Hitung", icon: Calculator, href: "/zakat" },
    { label: "Riwayat", icon: History, href: "/history" },
    { label: "Akun", icon: User, href: "/profile" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <nav className="flex items-center justify-between rounded-full bg-white/80 px-6 py-4 shadow-lg ring-1 ring-black/5 backdrop-blur-xl dark:bg-slate-900/80 dark:ring-white/10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive
                  ? "text-primary dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("size-6", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
