"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCfa } from "@/lib/invoice";

type CustomerOption = { id: string; name: string; phone: string | null };
type CatalogOption = { slug: string; name: string; price: number | null };

type Line = {
  description: string;
  quantity: string;
  unitPrice: string;
  productSlug: string;
};

export function SaleForm({
  customers,
  catalog,
  defaultCustomerId,
}: {
  customers: CustomerOption[];
  catalog: CatalogOption[];
  defaultCustomerId?: string;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(defaultCustomerId || "");
  const [type, setType] = useState<"FAC" | "INV">("FAC");
  const [source, setSource] = useState("");
  const [reference, setReference] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { description: "", quantity: "1", unitPrice: "", productSlug: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const q = Number(line.quantity) || 0;
        const p = Number(line.unitPrice) || 0;
        return sum + Math.round(q * p);
      }, 0),
    [lines],
  );

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  function addCatalogProduct(slug: string) {
    const product = catalog.find((p) => p.slug === slug);
    if (!product) return;
    setLines((prev) => [
      ...prev,
      {
        description: product.name,
        quantity: "1",
        unitPrice: product.price != null ? String(product.price) : "",
        productSlug: product.slug,
      },
    ]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        customerId: customerId || undefined,
        newCustomer:
          !customerId && newCustomerName
            ? { name: newCustomerName, phone: newCustomerPhone }
            : undefined,
        source,
        reference,
        lines: lines
          .filter((l) => l.description.trim())
          .map((l) => ({
            description: l.description,
            quantity: Number(l.quantity) || 1,
            unitPrice: Number(l.unitPrice) || 0,
            productSlug: l.productSlug || null,
          })),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Impossible de créer la facture.");
      return;
    }

    const sale = await res.json();
    router.push(`/admin/ventes/${sale.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-white/60">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "FAC" | "INV")}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
          >
            <option value="FAC">FAC (Facture)</option>
            <option value="INV">INV (Invoice)</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-white/60">
            Client existant
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
          >
            <option value="">— Nouveau client —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.phone ? ` (${c.phone})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!customerId ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="Nom du nouveau client *"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            required={!customerId}
          />
          <Input
            placeholder="Téléphone"
            value={newCustomerPhone}
            onChange={(e) => setNewCustomerPhone(e.target.value)}
          />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          placeholder="Source (ex. S00021)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <Input
          placeholder="Référence"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/60">
          Ajouter depuis le catalogue
        </label>
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              addCatalogProduct(e.target.value);
              e.target.value = "";
            }
          }}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
        >
          <option value="">Choisir un produit…</option>
          {catalog.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
              {p.price != null ? ` — ${p.price} CFA` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Lignes</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setLines((prev) => [
                ...prev,
                { description: "", quantity: "1", unitPrice: "", productSlug: "" },
              ])
            }
          >
            <Plus className="h-4 w-4" />
            Ligne
          </Button>
        </div>

        {lines.map((line, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-xl border border-white/8 p-3 sm:grid-cols-[1fr_90px_120px_40px]"
          >
            <Input
              placeholder="Description"
              value={line.description}
              onChange={(e) => updateLine(index, { description: e.target.value })}
              required
            />
            <Input
              placeholder="Qté"
              value={line.quantity}
              onChange={(e) => updateLine(index, { quantity: e.target.value })}
            />
            <Input
              placeholder="Prix"
              value={line.unitPrice}
              onChange={(e) => updateLine(index, { unitPrice: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setLines((prev) =>
                  prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
                )
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="text-white/55">Total</span>
        <span className="font-[family-name:var(--font-display)] text-xl font-bold">
          {formatCfa(total)}
        </span>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Création…" : "Créer la facture"}
      </Button>
    </form>
  );
}
