"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { getSmoothScroller } from "@/lib/smooth-scroll-store";
import { cn } from "@/lib/utils";

const RADIUS = 21;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Bouton « remonter en haut » (bas à droite) : apparaît après un écran de
 * défilement ; l’anneau jaune indique la progression dans la page.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setVisible(y > window.innerHeight * 0.8);
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(
          CIRCUMFERENCE * (1 - progress),
        );
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  function goTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smooth = getSmoothScroller();
    if (smooth && !reduced) {
      smooth.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  }

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Remonter en haut de la page"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#0b0b0f]/90 text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/15 backdrop-blur transition-all duration-300 hover:bg-[var(--lkm-yellow)] hover:text-[#0b0b0f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lkm-yellow)] sm:bottom-6 sm:right-6 sm:h-14 sm:w-14",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <circle
          ref={ringRef}
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="var(--lkm-yellow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          className="transition-[stroke-dashoffset] duration-150 group-hover:opacity-0"
        />
      </svg>
      <ArrowUp
        className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
        strokeWidth={2.25}
      />
    </button>
  );
}
