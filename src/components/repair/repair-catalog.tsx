"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  BatteryCharging,
  Camera,
  Cpu,
  Disc3,
  Droplets,
  Fan,
  Gamepad2,
  HardDrive,
  Keyboard,
  Laptop,
  MessageCircle,
  MonitorPlay,
  Plug,
  RefreshCw,
  Smartphone,
  Speaker,
  Tablet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  deviceTypes,
  repairCategories,
  type RepairCategory,
  type RepairItem,
} from "@/data/repairs";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  buildRepairQuoteMessage,
  buildRepairWhatsAppMessage,
  getWhatsAppUrl,
} from "@/lib/whatsapp";

const icons: Record<string, LucideIcon> = {
  BatteryCharging,
  Camera,
  Cpu,
  Disc3,
  Droplets,
  Fan,
  Gamepad2,
  HardDrive,
  Keyboard,
  Laptop,
  MonitorPlay,
  Plug,
  RefreshCw,
  Smartphone,
  Speaker,
  Tablet,
  Wrench,
};

function openWhatsApp(message: string) {
  window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}

/** Tarifs de réparation par appareil + demande WhatsApp en un clic. */
export function RepairCatalog({
  items: allItems,
  labor,
}: {
  items: RepairItem[];
  labor: number;
}) {
  const tabs = repairCategories.filter((c) =>
    allItems.some((item) => item.category === c.id),
  );
  const [category, setCategory] = useState<RepairCategory>(
    tabs[0]?.id ?? "phone",
  );
  const [device, setDevice] = useState("");
  const [quote, setQuote] = useState({ deviceType: deviceTypes[0], device: "", issue: "" });

  const items = useMemo(
    () => allItems.filter((item) => item.category === category),
    [allItems, category],
  );

  return (
    <div>
      {/* Appareil + onglets */}
      <div className="flex flex-col gap-5 rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)] p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <label className="block w-full lg:max-w-md">
          <span className="text-sm font-semibold text-white">
            Votre appareil (marque et modèle)
          </span>
          <input
            value={device}
            onChange={(e) => setDevice(e.target.value)}
            placeholder="ex. iPhone 12, Samsung A14, HP EliteBook, PS4…"
            className="mt-2 h-12 w-full rounded-full border border-white/12 bg-black/30 px-5 text-sm text-white placeholder:text-white/35 focus:border-[var(--lkm-yellow)] focus:outline-none"
          />
          <span className="mt-2 block text-xs text-white/40">
            Facultatif : il sera ajouté à votre message WhatsApp.
          </span>
        </label>
        <div
          role="tablist"
          aria-label="Type d’appareil"
          className="flex flex-wrap gap-2"
        >
          {tabs.map((c) => {
            const Icon = icons[c.icon] ?? Wrench;
            const active = c.id === category;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-[var(--lkm-yellow)] text-[#1a1400]"
                    : "border border-white/12 bg-white/5 text-white/75 hover:bg-white/10",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartes */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = icons[item.icon] ?? Wrench;
          const isService = item.service != null;
          const laborOnly = !isService && item.partFrom == null && item.labor != null;
          const onQuote = !isService && item.partFrom == null && item.labor == null;
          return (
            <article
              key={item.id}
              className="flex flex-col justify-between gap-6 rounded-[1.5rem] border border-white/10 bg-[var(--lkm-surface)] p-6 transition hover:border-white/25"
            >
              <div>
                {item.image ? (
                  <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-black/30">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1280px) 45vw, 420px"
                      className="object-cover"
                    />
                    {item.popular ? (
                      <span className="absolute left-3 top-3 rounded-full bg-[var(--lkm-yellow)] px-2.5 py-1 text-[11px] font-bold text-[#1a1400]">
                        Le plus demandé
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--lkm-green)]/15 text-[#3ddc8a]">
                      <Icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    {item.popular ? (
                      <span className="rounded-full bg-[var(--lkm-yellow)] px-2.5 py-1 text-[11px] font-bold text-[#1a1400]">
                        Le plus demandé
                      </span>
                    ) : null}
                  </div>
                )}
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {item.description}
                </p>
              </div>

              <div>
                <div className="rounded-2xl bg-black/25 p-4">
                  {laborOnly ? (
                    <>
                      <p className="text-xs text-white/45">Main d’œuvre</p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                        {formatPrice(item.labor)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--lkm-yellow)]">
                        + pièce selon le modèle (prix sur WhatsApp)
                      </p>
                    </>
                  ) : onQuote ? (
                    <>
                      <p className="text-xs text-white/45">Prix</p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                        Sur devis
                      </p>
                      <p className="mt-1 text-xs text-[var(--lkm-yellow)]">
                        main d’œuvre {formatPrice(labor)} + pièce selon le modèle
                      </p>
                    </>
                  ) : isService ? (
                    <>
                      <p className="text-xs text-white/45">Forfait</p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                        {formatPrice(item.service)}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        Main d’œuvre comprise
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-white/45">Pièce à partir de</p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                        {formatPrice(item.partFrom)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--lkm-yellow)]">
                        + main d’œuvre {formatPrice(item.labor ?? labor)}
                      </p>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsApp(buildRepairWhatsAppMessage(item, device, labor))
                  }
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-[#052e14] transition hover:bg-[#2fe472]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Demander sur WhatsApp
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-white/40">
        Prix indicatifs : le prix exact dépend de la marque et du modèle, il
        vous est confirmé sur WhatsApp avant toute réparation.
      </p>

      {/* Autre panne */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          openWhatsApp(buildRepairQuoteMessage(quote));
        }}
        className="mt-12 grid gap-6 rounded-[2rem] bg-[var(--lkm-cream)] p-7 text-[#0b0b0f] sm:p-10 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <div>
          <span className="inline-flex rounded-full bg-[#0b0b0f] px-3 py-1 text-xs font-semibold text-white">
            Autre panne
          </span>
          <h3 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
            Votre panne n’est pas dans la liste ?
          </h3>
          <p className="mt-3 text-[#0b0b0f]/60">
            Décrivez-la : votre demande part directement sur notre WhatsApp et
            on vous répond avec un prix.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">Type d’appareil</span>
            <select
              value={quote.deviceType}
              onChange={(e) => setQuote({ ...quote, deviceType: e.target.value })}
              className="mt-2 h-12 w-full rounded-full border border-black/10 bg-white px-4 text-sm focus:border-[var(--lkm-blue)] focus:outline-none"
            >
              {deviceTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Marque et modèle</span>
            <input
              value={quote.device}
              onChange={(e) => setQuote({ ...quote, device: e.target.value })}
              placeholder="ex. Tecno Spark 10"
              className="mt-2 h-12 w-full rounded-full border border-black/10 bg-white px-5 text-sm placeholder:text-black/35 focus:border-[var(--lkm-blue)] focus:outline-none"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Quelle est la panne ?</span>
            <textarea
              value={quote.issue}
              onChange={(e) => setQuote({ ...quote, issue: e.target.value })}
              rows={3}
              required
              placeholder="ex. Le téléphone ne s’allume plus depuis hier…"
              className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm placeholder:text-black/35 focus:border-[var(--lkm-blue)] focus:outline-none"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-[#052e14] transition hover:bg-[#2fe472] sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Envoyer ma demande sur WhatsApp
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
