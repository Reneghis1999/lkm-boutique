"use client";

import { motion } from "framer-motion";
import {
  Gamepad2,
  MapPin,
  MessageCircle,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { valueProps } from "@/data/services";

const icons: Record<string, LucideIcon> = {
  Tag,
  MapPin,
  Gamepad2,
  MessageCircle,
};

export function ValueStrip() {
  return (
    <section className="border-y border-white/6 bg-white/[0.02]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {valueProps.map((item, i) => {
          const Icon = icons[item.icon] ?? Tag;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[var(--lkm-blue)]">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-white/45">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
