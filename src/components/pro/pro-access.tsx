"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRO_DISCOUNT } from "@/lib/pro-price";
import { useProStore, useProSync } from "@/store/pro";

const pct = `${Math.round(PRO_DISCOUNT * 100)} %`;

export function ProAccess() {
  useProSync();
  const { pro, name, checked, set } = useProStore();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as { pro?: boolean; name?: string; reason?: string };
      if (data.pro) {
        set(true, data.name ?? null);
        setCode("");
      } else {
        setError(
          data.reason === "too_many"
            ? "Trop d’essais. Réessayez dans quelques minutes."
            : "Code incorrect. Demandez votre code pro à LKM Boutique.",
        );
      }
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/pro", { method: "DELETE" }).catch(() => undefined);
    set(false, null);
  }

  if (!checked) {
    return <Loader2 className="h-6 w-6 animate-spin text-white/40" />;
  }

  if (pro) {
    return (
      <div className="rounded-[1.75rem] border border-[var(--lkm-blue)]/40 bg-[var(--lkm-blue)]/10 p-6 sm:p-8">
        <p className="flex items-center gap-2 text-lg font-semibold text-white">
          <BadgeCheck className="h-5 w-5 text-[var(--lkm-blue)]" />
          Espace pro actif{name && name !== "pro" ? ` — ${name}` : ""}
        </p>
        <p className="mt-2 text-white/65">
          Tous les prix du site sont affichés avec votre remise réparateur de{" "}
          <strong className="text-white">-{pct}</strong>. Vos commandes WhatsApp
          sont marquées « Client PRO ».
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/boutique"
            className="rounded-full bg-[var(--lkm-yellow)] px-5 py-2.5 text-sm font-semibold text-[#1a1400]"
          >
            Voir les pièces et produits
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 hover:text-white"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={login}
      className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)] p-6 sm:p-8"
    >
      <label className="block">
        <span className="mb-1.5 block text-sm text-white/55">Votre code pro</span>
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="ex. LKM-XXXX"
          className="w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white placeholder:text-white/35 focus:border-[var(--lkm-yellow)] focus:outline-none"
        />
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        Accéder à l’espace pro
      </Button>
    </form>
  );
}
