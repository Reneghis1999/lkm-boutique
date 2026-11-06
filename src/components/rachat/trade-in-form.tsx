"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const ACTIONS = ["Vendre", "Échanger"] as const;
const BRANDS = ["iPhone", "Samsung", "Autre"] as const;
const STORAGE = ["64 Go", "128 Go", "256 Go", "512 Go", "1 To", "Je ne sais pas"] as const;
const STATES = [
  { value: "Comme neuf", hint: "aucune rayure" },
  { value: "Bon état", hint: "petites traces d’usage" },
  { value: "Abîmé", hint: "rayures, chocs" },
  { value: "Écran cassé", hint: "ou autre panne" },
] as const;
const EXTRAS = ["Boîte", "Chargeur", "Facture"] as const;

function Choice<T extends string>({
  label,
  values,
  value,
  onChange,
  hints,
}: {
  label: string;
  values: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
  hints?: Partial<Record<T, string>>;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-white/55">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              value === v
                ? "border-[var(--lkm-yellow)] bg-[var(--lkm-yellow)] text-[#1a1400]"
                : "border-white/15 text-white/80 hover:border-white/40",
            )}
          >
            {v}
            {hints?.[v] ? <span className="ml-1 text-xs opacity-60">({hints[v]})</span> : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function TradeInForm() {
  const [action, setAction] = useState<(typeof ACTIONS)[number] | "">("");
  const [brand, setBrand] = useState<(typeof BRANDS)[number] | "">("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState<(typeof STORAGE)[number] | "">("");
  const [state, setState] = useState<(typeof STATES)[number]["value"] | "">("");
  const [battery, setBattery] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [wanted, setWanted] = useState("");
  const [name, setName] = useState("");
  const [tried, setTried] = useState(false);

  const missing = !action || !brand || !model.trim() || !storage || !state;

  function send(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (missing) return;
    const lines = [
      "Bonjour LKM Boutique,",
      "",
      `Je souhaite ${action === "Vendre" ? "vendre" : "échanger"} mon téléphone :`,
      `• Modèle : ${brand === "Autre" ? "" : `${brand} `}${model.trim()}`,
      `• Capacité : ${storage}`,
      `• État : ${state}`,
      battery.trim() ? `• Batterie : ${battery.trim()}` : null,
      `• Avec : ${extras.length ? extras.join(", ") : "téléphone seul"}`,
      action === "Échanger" && wanted.trim() ? `• Je voudrais à la place : ${wanted.trim()}` : null,
      name.trim() ? `\nNom : ${name.trim()}` : null,
      "",
      "Quel prix pouvez-vous me proposer ? Je peux envoyer des photos.",
    ].filter((l) => l !== null);
    window.open(getWhatsAppUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white placeholder:text-white/35 focus:border-[var(--lkm-yellow)] focus:outline-none";

  return (
    <form
      onSubmit={send}
      className="space-y-6 rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)] p-5 sm:p-8"
    >
      <Choice label="Je veux" values={ACTIONS} value={action} onChange={setAction} />
      <Choice label="Marque" values={BRANDS} value={brand} onChange={setBrand} />
      <label className="block">
        <span className="mb-1.5 block text-sm text-white/55">Modèle</span>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={brand === "Samsung" ? "ex. Galaxy S23" : "ex. iPhone 13 Pro Max"}
          className={field}
        />
      </label>
      <Choice label="Capacité" values={STORAGE} value={storage} onChange={setStorage} />
      <Choice
        label="État"
        values={STATES.map((s) => s.value)}
        value={state}
        onChange={setState}
        hints={Object.fromEntries(STATES.map((s) => [s.value, s.hint]))}
      />
      <label className="block">
        <span className="mb-1.5 block text-sm text-white/55">
          Santé de la batterie (facultatif)
        </span>
        <input
          value={battery}
          onChange={(e) => setBattery(e.target.value)}
          placeholder="ex. 86 % (Réglages › Batterie)"
          className={field}
        />
      </label>
      <fieldset>
        <legend className="mb-2 text-sm text-white/55">Je donne aussi (facultatif)</legend>
        <div className="flex flex-wrap gap-2">
          {EXTRAS.map((x) => {
            const on = extras.includes(x);
            return (
              <button
                key={x}
                type="button"
                aria-pressed={on}
                onClick={() => setExtras((l) => (on ? l.filter((y) => y !== x) : [...l, x]))}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  on
                    ? "border-[var(--lkm-yellow)] bg-[var(--lkm-yellow)] text-[#1a1400]"
                    : "border-white/15 text-white/80 hover:border-white/40",
                )}
              >
                {x}
              </button>
            );
          })}
        </div>
      </fieldset>
      {action === "Échanger" && (
        <label className="block">
          <span className="mb-1.5 block text-sm text-white/55">Téléphone souhaité à la place</span>
          <input
            value={wanted}
            onChange={(e) => setWanted(e.target.value)}
            placeholder="ex. iPhone 15 Pro"
            className={field}
          />
        </label>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm text-white/55">Votre nom (facultatif)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className={field}
        />
      </label>

      {tried && missing && (
        <p className="text-sm text-red-300">
          Choisissez vendre/échanger, la marque, le modèle, la capacité et l’état.
        </p>
      )}
      <Button type="submit" size="lg" variant="whatsapp" className="w-full">
        <MessageCircle className="h-4 w-4" />
        Recevoir mon prix sur WhatsApp
      </Button>
      <p className="text-center text-xs text-white/40">
        Le prix final est confirmé en boutique après vérification du téléphone.
      </p>
    </form>
  );
}
