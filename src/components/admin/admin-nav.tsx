"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [{ href: "/admin", label: "Statut Odoo", icon: Plug }];

export function AdminNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-white/10 bg-[#121216] lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
          LKM Admin
        </p>
        <p className="mt-1 text-xs text-white/45">
          {userName || "Administrateur"} · sync Odoo
        </p>
      </div>
      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto p-3 lg:flex-col">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition",
                active
                  ? "bg-white/10 text-white"
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
          className="w-full justify-start border-white/15 bg-white/5 text-white hover:bg-white/10"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
