"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { QUOTE_PARTS, type QuotePart, type RepairQuoteData } from "@/lib/repair-quote";
import { shopAvailabilityText } from "@/lib/variants";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

function Chips<T extends string>({
  values,
  value,
  onChange,
  disabled,
}: {
  values: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
  disabled?: (v: T) => boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => {
        const off = disabled?.(v) ?? false;
        return (
          <button
            key={v}
            type="button"
            disabled={off}
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              value === v
                ? "border-[var(--lkm-yellow)] bg-[var(--lkm-yellow)] text-[#1a1400]"
                : "border-white/15 text-white/80 hover:border-white/40",
              off && "cursor-not-allowed opacity-30 hover:border-white/15",
            )}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

export function RepairQuote({ data }: { data: RepairQuoteData }) {
  const [model, setModel] = useState("");
  const [part, setPart] = useState<QuotePart | "">("");
  const [optionIndex, setOptionIndex] = useState(0);

  const forModel = useMemo(
    () => data.entries.filter((e) => e.model.toLowerCase() === model.toLowerCase()),
    [data.entries, model],
  );
  const entry = forModel.find((e) => e.part === part);
  const option = entry?.options[optionIndex] ?? entry?.options[0];
  const labor = part ? data.labor[part] : 0;
  const total = option ? option.price + labor : null;

  if (data.models.length === 0) return null;

  function reserve() {
    if (!option || !part || total == null) return;
    const message = [
      "Bonjour LKM Boutique,",
      "",
      "Je voudrais réserver une réparation :",
      `• Téléphone : ${model}`,
      `• Panne : ${part}`,
      option.label && option.label !== "Standard" ? `• Pièce : ${option.label}` : null,
      `• Prix affiché : ${formatPrice(option.price)} (pièce) + ${formatPrice(labor)} (main d’œuvre) = ${formatPrice(total)}`,
      option.availableAt?.length ? `• Boutique : ${option.availableAt.join(" ou ")}` : null,
      "",
      "Quand puis-je passer ?",
    ]
      .filter((l) => l !== null)
      .join("\n");
    window.location.assign(getWhatsAppUrl(message));
  }

  const labelCls = "mb-2 block text-sm text-white/55";

  return (
    <div className="grid gap-8 rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)] p-5 sm:p-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-6">
        <label className="block">
          <span className={labelCls}>1. Votre iPhone</span>
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setPart("");
              setOptionIndex(0);
            }}
            className="w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white focus:border-[var(--lkm-yellow)] focus:outline-none"
          >
            <option value="">Choisir le modèle…</option>
            {data.models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        {model && (
          <div>
            <span className={labelCls}>2. La panne</span>
            <Chips
              values={QUOTE_PARTS}
              value={part}
              onChange={(v) => {
                setPart(v);
                setOptionIndex(0);
              }}
              disabled={(v) => !forModel.some((e) => e.part === v)}
            />
          </div>
        )}

        {entry && entry.options.length > 1 && (
          <div>
            <span className={labelCls}>3. La pièce</span>
            <div className="flex flex-wrap gap-2">
              {entry.options.map((o, i) => (
                <button
                  key={`${o.label}-${i}`}
                  type="button"
                  aria-pressed={i === optionIndex}
                  onClick={() => setOptionIndex(i)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    i === optionIndex
                      ? "border-[var(--lkm-yellow)] bg-[var(--lkm-yellow)] text-[#1a1400]"
                      : "border-white/15 text-white/80 hover:border-white/40",
                    o.inStock === false && i !== optionIndex && "opacity-50 line-through",
                  )}
                >
                  {o.label} · {formatPrice(o.price)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-[#0b0b0f] p-5">
        {option && part ? (
          <div className="space-y-2 text-sm">
            <p className="text-white/55">
              {model} · {part}
              {option.label && option.label !== "Standard" ? ` · ${option.label}` : ""}
            </p>
            <div className="flex justify-between text-white/75">
              <span>Pièce</span>
              <span>{formatPrice(option.price)}</span>
            </div>
            <div className="flex justify-between text-white/75">
              <span>Main d’œuvre</span>
              <span>{formatPrice(labor)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
              <span className="text-white">Total</span>
              <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--lkm-yellow)]">
                {formatPrice(total)}
              </span>
            </div>
            <p className={option.inStock === false ? "text-red-300" : "text-[#3ddc8a]"}>
              {option.inStock === false
                ? "Pièce en rupture — on vous dit quand elle revient"
                : shopAvailabilityText(option.availableAt) ?? "Disponible"}
            </p>
            <Link href={`/produit/${option.slug}`} className="inline-block text-xs text-white/45 underline-offset-4 hover:underline">
              Voir la pièce
            </Link>
          </div>
        ) : (
          <p className="text-sm text-white/45">
            Choisissez votre iPhone et la panne : le prix s’affiche ici.
          </p>
        )}
        <Button
          type="button"
          variant="whatsapp"
          size="lg"
          className="mt-6 w-full"
          disabled={!option || !part}
          onClick={reserve}
        >
          <MessageCircle className="h-4 w-4" />
          Réserver sur WhatsApp
        </Button>
      </div>
    </div>
  );
}
