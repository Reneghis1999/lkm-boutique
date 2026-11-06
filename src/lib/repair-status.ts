/** Étapes affichées au client, dans l’ordre. */
export const REPAIR_STEPS = [
  { key: "received", label: "Reçu en boutique" },
  { key: "repairing", label: "En réparation" },
  { key: "ready", label: "Prêt à récupérer" },
  { key: "done", label: "Récupéré" },
] as const;

export type RepairStatus = (typeof REPAIR_STEPS)[number]["key"] | "cancelled";

export type RepairLookup =
  | {
      ok: true;
      reference: string;
      status: RepairStatus;
      date: string | null;
      shop: string | null;
      items: string[];
      total: number | null;
    }
  | { ok: false; reason: "not_found" | "error" };
