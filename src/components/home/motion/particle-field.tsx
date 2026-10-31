"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
};

const DEFAULT_COLORS = ["#f5c518", "#7dffb6", "#ffffff", "#4fb0ff"];

/**
 * Nuage de particules reliées (canvas léger). S’arrête quand il n’est plus
 * visible et reste figé si l’utilisateur préfère réduire les animations.
 */
export function ParticleField({
  className,
  colors = DEFAULT_COLORS,
  density = 5200,
}: {
  className?: string;
  colors?: string[];
  density?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999 };
    const LINK = 110;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(150, Math.max(40, (w * h) / density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.5,
        c: colors[Math.floor(Math.random() * colors.length)],
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        if (!reduced) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120 && d2 > 0) {
            const f = (1 - Math.sqrt(d2) / 120) * 0.6;
            p.vx += (dx / Math.sqrt(d2)) * f * 0.08;
            p.vy += (dy / Math.sqrt(d2)) * f * 0.08;
          }
          p.vx *= 0.995;
          p.vy *= 0.995;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
      }
      ctx!.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx!.globalAlpha = (1 - Math.sqrt(d2) / LINK) * 0.28;
            ctx!.strokeStyle = a.c;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx!.globalAlpha = 0.9;
        ctx!.fillStyle = p.c;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    function loop() {
      if (visible && !document.hidden) draw();
      raf = window.requestAnimationFrame(loop);
    }

    resize();
    draw();
    if (!reduced) raf = window.requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    const parent = canvas.parentElement;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    parent?.addEventListener("pointermove", onMove);
    parent?.addEventListener("pointerleave", onLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      parent?.removeEventListener("pointermove", onMove);
      parent?.removeEventListener("pointerleave", onLeave);
    };
  }, [colors, density]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
