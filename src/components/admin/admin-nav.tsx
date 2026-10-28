"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/ventes", label: "Ventes / Factures", icon: FileText },
  { href: "/admin/ventes/nouvelle", label: "Nouvelle facture", icon: PlusCircle },
];

export function AdminNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-white/10 bg-[var(--lkm-surface)] lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
          LKM Admin
        </p>
        <p className="mt-1 text-xs text-white/45">{userName || "Administrateur"}</p>
      </div>
      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto p-3 lg:flex-col">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition",
                active
                  ? "bg-[var(--lkm-blue)]/20 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white",
              )}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.75} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
