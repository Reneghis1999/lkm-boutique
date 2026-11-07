"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DashboardLogin() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mx-auto mt-10 max-w-sm space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const r = await fetch("/api/tableau", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        setBusy(false);
        if (r.ok) window.location.reload();
        else setError(r.status === 429 ? "Trop d’essais. Réessayez plus tard." : "Code incorrect.");
      }}
    >
      <input
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code du tableau de bord"
        autoComplete="current-password"
        className="w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white focus:border-[var(--lkm-yellow)] focus:outline-none"
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        Ouvrir
      </Button>
    </form>
  );
}

export function DashboardLogout() {
  return (
    <button
      type="button"
      className="text-sm text-white/45 hover:text-white"
      onClick={async () => {
        await fetch("/api/tableau", { method: "DELETE" });
        window.location.reload();
      }}
    >
      Se déconnecter
    </button>
  );
}
