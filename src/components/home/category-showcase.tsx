"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const accentStyles = {
  blue: "border-[var(--lkm-blue)]/25 hover:border-[var(--lkm-blue)]/50",
  green: "border-[var(--lkm-green)]/25 hover:border-[var(--lkm-green)]/50",
  yellow: "border-[var(--lkm-yellow)]/25 hover:border-[var(--lkm-yellow)]/50",
};

type Group = {
  id: string;
  title: string;
  description: string;
  accent: "blue" | "green" | "yellow";
  href: string;
  count: number;
  image?: string | null;
};

export function CategoryShowcase({ groups }: { groups: Group[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
          Catalogue
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Explorez par univers
        </h2>
        <p className="mt-3 text-white/50">
          Quatre portes d’entrée vers le stock réel de LKM Boutique à Lomé.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group, i) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
          >
            <Link
              href={group.href}
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--lkm-surface)] p-4 transition duration-300",
                accentStyles[group.accent],
              )}
            >
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-[#0d0d10]">
                {group.image ? (
                  <Image
                    src={group.image}
                    alt={group.title}
                    fill
                    sizes="280px"
                    className="object-contain p-4 transition duration-300 group-hover:scale-[1.04]"
                  />
                ) : null}
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                {group.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">
                {group.description}
              </p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-white/40">{group.count} produits</span>
                <ArrowUpRight
                  className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                  strokeWidth={1.75}
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
