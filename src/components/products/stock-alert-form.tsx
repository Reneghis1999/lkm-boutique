"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "open" | "sending" | "done" | "error" | "too_many";

export function StockAlertForm({
  product,
  slug,
  options,
}: {
  product: string;
  slug: string;
  options?: Record<string, string>;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const choice = options && Object.keys(options).length ? Object.values(options).join(", ") : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/alerte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, slug, options, name, phone, website }),
      });
      if (res.status === 429) return setStatus("too_many");
      const data = (await res.json()) as { ok: boolean };
      setStatus(data.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="mt-4 flex items-start gap-2 rounded-2xl border border-[#3ddc8a]/30 bg-[#3ddc8a]/10 p-4 text-sm text-[#9ff0c4]">
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
        C’est noté ! On vous appelle dès que « {product}
        {choice ? ` (${choice})` : ""} » revient en boutique.
      </p>
    );
  }

  if (status === "idle") {
    return (
      <Button variant="outline" className="mt-4 w-full" onClick={() => setStatus("open")}>
        <Bell className="h-4 w-4" />
        Prévenez-moi quand c’est revenu
      </Button>
    );
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white placeholder:text-white/35 focus:border-[var(--lkm-yellow)] focus:outline-none";

  return (
    <form
      onSubmit={submit}
      className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-4"
    >
      <p className="text-sm text-white/70">
        Laissez votre numéro : on vous prévient dès que{" "}
        <span className="text-white">
          {product}
          {choice ? ` (${choice})` : ""}
        </span>{" "}
        revient.
      </p>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom"
        autoComplete="name"
        className={field}
      />
      <input
        required
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Votre téléphone (ex. 90 00 00 00)"
        autoComplete="tel"
        className={field}
      />
      {/* Champ piège pour les robots, invisible pour les clients */}
      <input
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        name="website"
      />
      {(status === "error" || status === "too_many") && (
        <p className="text-sm text-red-300">
          {status === "too_many"
            ? "Trop de demandes. Réessayez dans quelques minutes."
            : "Envoi impossible. Vérifiez le numéro ou écrivez-nous sur WhatsApp."}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
        Me prévenir
      </Button>
    </form>
  );
}
