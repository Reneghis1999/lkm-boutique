"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CustomerForm({
  initial,
}: {
  initial?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      address: String(fd.get("address") || ""),
      notes: String(fd.get("notes") || ""),
    };

    const res = await fetch(
      initial ? `/api/admin/customers/${initial.id}` : "/api/admin/customers",
      {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l’enregistrement.");
      return;
    }

    const data = await res.json();
    router.push(`/admin/clients/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        name="name"
        placeholder="Nom du client *"
        defaultValue={initial?.name}
        required
      />
      <Input
        name="phone"
        placeholder="Téléphone"
        defaultValue={initial?.phone || ""}
      />
      <Input
        name="email"
        type="email"
        placeholder="Email"
        defaultValue={initial?.email || ""}
      />
      <Input
        name="address"
        placeholder="Adresse"
        defaultValue={initial?.address || ""}
      />
      <textarea
        name="notes"
        placeholder="Notes"
        defaultValue={initial?.notes || ""}
        className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[var(--lkm-blue)]/60"
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Enregistrement…" : initial ? "Mettre à jour" : "Créer le client"}
      </Button>
    </form>
  );
}
