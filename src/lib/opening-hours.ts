import { shop } from "@/data/shop";

const DAY_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAY_LONG = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Slot = { opens: number; closes: number } | null;

function fmtHour(h: number) {
  const whole = Math.floor(h);
  const min = Math.round((h - whole) * 60);
  return min ? `${whole}h${String(min).padStart(2, "0")}` : `${whole}h`;
}

/** « Lun – Sam : 8h – 21h », « Dim : 10h – 20h » (jours consécutifs regroupés). */
export function hoursSummary(weekly: Slot[] = shop.hours.weekly): string[] {
  const order = [1, 2, 3, 4, 5, 6, 0]; // lundi → dimanche
  const groups: { days: number[]; slot: Slot }[] = [];
  for (const d of order) {
    const slot = weekly[d] ?? null;
    const last = groups[groups.length - 1];
    const same =
      last &&
      ((last.slot === null && slot === null) ||
        (last.slot && slot && last.slot.opens === slot.opens && last.slot.closes === slot.closes));
    if (same) last.days.push(d);
    else groups.push({ days: [d], slot });
  }
  return groups.map(({ days, slot }) => {
    const label =
      days.length === 1
        ? DAY_SHORT[days[0]]
        : `${DAY_SHORT[days[0]]} – ${DAY_SHORT[days[days.length - 1]]}`;
    return `${label} : ${slot ? `${fmtHour(slot.opens)} – ${fmtHour(slot.closes)}` : "fermé"}`;
  });
}

/** Jour (0 = dimanche) et heure décimale dans le fuseau de la boutique. */
export function shopClock(now: Date, timeZone = shop.hours.timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    day: Math.max(0, EN_DAYS.indexOf(get("weekday"))),
    hour: Number(get("hour")) + Number(get("minute")) / 60,
  };
}

/** Ouvert / fermé maintenant, avec la prochaine ouverture ou fermeture. */
export function openingStatus(now: Date, weekly: Slot[] = shop.hours.weekly) {
  const { day, hour } = shopClock(now);
  const today = weekly[day];
  if (today && hour >= today.opens && hour < today.closes) {
    return { open: true, label: `Ouvert maintenant · ferme à ${fmtHour(today.closes)}` };
  }
  if (today && hour < today.opens) {
    return { open: false, label: `Fermé · ouvre à ${fmtHour(today.opens)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const slot = weekly[d];
    if (slot) {
      const when = i === 1 ? "demain" : DAY_LONG[d];
      return { open: false, label: `Fermé · ouvre ${when} à ${fmtHour(slot.opens)}` };
    }
  }
  return { open: false, label: "Fermé" };
}
