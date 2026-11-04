import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPhonesByBrand } from "@/lib/phones";

export const metadata: Metadata = {
  title: "Portables",
  description:
    "Téléphones portables chez LKM Boutique à Lomé : iPhone, Samsung, Motorola et autres marques. Prix en CFA, commande sur WhatsApp.",
  alternates: { canonical: "/portables" },
};

export default async function PortablesPage() {
  const brands = await getPhonesByBrand();

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
          Portables
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-white sm:text-5xl">
          Choisissez votre marque
        </h1>
        <p className="mt-4 max-w-2xl text-white/50">
          Tous nos téléphones, rangés par marque — cliquez pour voir les modèles
          et les prix.
        </p>

        {brands.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-white/8 bg-[var(--lkm-surface)] px-6 py-16 text-center text-white/45">
            Aucun téléphone en ligne pour le moment.
          </p>
        ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/portables/${brand.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-4 transition hover:border-white/25"
              >
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-[#0d0d10]">
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      fill
                      sizes="320px"
                      className="object-contain p-4 transition duration-300 group-hover:scale-[1.04]"
                    />
                  ) : null}
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                  {brand.name}
                </h2>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-white/40">
                    {brand.count} modèle{brand.count > 1 ? "s" : ""}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                    strokeWidth={1.75}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
