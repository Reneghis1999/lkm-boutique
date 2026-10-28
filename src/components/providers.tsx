"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <SessionProvider>
      {children}
      {!isAdmin ? <CartDrawer /> : null}
      <Toaster />
    </SessionProvider>
  );
}
