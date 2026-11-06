"use client";

import { useState } from "react";
import { Check, Loader2, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewButton, reviewUrlFor } from "@/components/shop/review-button";
import { formatPrice } from "@/lib/format";
import { REPAIR_STEPS, type RepairLookup } from "@/lib/repair-status";
import { cn } from "@/lib/utils";

type Result = RepairLookup | { ok: false; reason: "too_many" };

const MESSAGES: Record<string, string> = {
  not_found:
    "Aucune réparation trouvée. Vérifiez le numéro de ticket et le téléphone donné en boutique.",
  error: "Le suivi est momentanément indisponible. Réessayez dans un instant ou écrivez-nous sur WhatsApp.",
  too_many: "Trop d’essais. Réessayez dans quelques minutes.",
};

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function RepairTracker() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/suivi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, phone }),
      });
      setResult((await res.json()) as Result);
    } catch {
      setResult({ ok: false, reason: "error" });
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white placeholder:text-white/35 focus:border-[var(--lkm-yellow)] focus:outline-none";

  return (
    <div className="space-y-8">
      <form
        onSubmit={submit}
        className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)] p-5 sm:grid-cols-[1fr_1fr_auto] sm:p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm text-white/55">N° de ticket</span>
          <input
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="ex. S00042"
            autoCapitalize="characters"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-white/55">Votre téléphone</span>
          <input
            required
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="ex. 90 00 00 00"
            className={field}
          />
        </label>
        <Button type="submit" size="lg" className="self-end" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Suivre
        </Button>
      </form>

      {result && !result.ok && (
        <p className="flex items-start gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {MESSAGES[result.reason]}
        </p>
      )}

      {result?.ok && (
        <div className="rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)] p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
              Ticket {result.reference}
            </h2>
            <span className="text-sm text-white/45">
              {[result.shop, formatDate(result.date)].filter(Boolean).join(" · ")}
            </span>
          </div>

          {result.status === "cancelled" ? (
            <p className="mt-6 text-white/70">
              Cette réparation a été annulée. Contactez-nous pour plus
              d’informations.
            </p>
          ) : (
            <ol className="mt-8 grid gap-4 sm:grid-cols-4">
              {REPAIR_STEPS.map((step, i) => {
                const current = REPAIR_STEPS.findIndex((s) => s.key === result.status);
                const done = i < current;
                const active = i === current;
                return (
                  <li key={step.key} className="flex items-center gap-3 sm:flex-col sm:items-start">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        done && "bg-[var(--lkm-green,#00a859)] text-white",
                        active && "bg-[var(--lkm-yellow)] text-[#0b0b0f] ring-4 ring-[var(--lkm-yellow)]/25",
                        !done && !active && "bg-white/10 text-white/40",
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        active ? "font-semibold text-white" : done ? "text-white/70" : "text-white/35",
                      )}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {(result.status === "ready" || result.status === "done") &&
            reviewUrlFor(result.shop) && (
              <div className="mt-8 rounded-2xl border border-[var(--lkm-yellow)]/30 bg-[var(--lkm-yellow)]/10 p-5">
                <p className="text-white">
                  Satisfait de votre réparation ? Votre avis nous aide beaucoup 🙏
                </p>
                <ReviewButton href={reviewUrlFor(result.shop)!} className="mt-3" />
              </div>
            )}

          {result.items.length > 0 && (
            <ul className="mt-8 space-y-1 border-t border-white/10 pt-5 text-sm text-white/65">
              {result.items.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          )}
          {result.total !== null && result.total > 0 && (
            <p className="mt-4 text-right font-[family-name:var(--font-display)] text-xl font-bold text-white">
              {formatPrice(result.total)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
