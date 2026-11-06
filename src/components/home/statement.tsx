"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/lib/i18n/lang";

const TEXT = {
  fr: [
    "Pas besoin de deviner : les prix sont en ligne, la commande part sur WhatsApp, et",
    "vous testez sur place",
    "avant de repartir avec votre matériel.",
  ],
  en: [
    "No guesswork: prices are online, your order goes on WhatsApp, and",
    "you try it in store",
    "before you leave with your device.",
  ],
};

/** Phrase dont les mots s’allument au fil du défilement, avec un surligneur. */
export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const [before, marked, after] = TEXT[useLang()].map((t) => t.split(" "));

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".statement-text",
          start: "top 80%",
          end: "bottom 45%",
          scrub: true,
        },
      });
      tl.fromTo(
        ".statement-word",
        { opacity: 0.16 },
        { opacity: 1, stagger: 0.1, ease: "none" },
      ).fromTo(
        ".statement-mark",
        { backgroundSize: "0% 100%" },
        { backgroundSize: "100% 100%", ease: "none", duration: 1.2 },
        "-=1.6",
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const word = (w: string, i: number) => (
    <span key={i} className="statement-word inline-block pr-[0.25em]">
      {w}
    </span>
  );

  return (
    <section ref={ref} data-no-translate className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-36">
      <p className="statement-text font-[family-name:var(--font-display)] text-[1.9rem] font-medium leading-[1.15] tracking-[-0.025em] text-white sm:text-5xl lg:text-[3.6rem]">
        {before.map(word)}
        <span
          className="statement-mark rounded-md bg-gradient-to-r from-[var(--lkm-yellow)] to-[var(--lkm-yellow)] bg-no-repeat px-1 text-[#0b0b0f] [box-decoration-break:clone] [background-size:100%_100%]"
        >
          {marked.map((w, i) => word(w, 100 + i))}
        </span>{" "}
        {after.map((w, i) => word(w, 200 + i))}
      </p>
    </section>
  );
}
