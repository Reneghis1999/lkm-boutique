"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Supprimer ce produit définitivement ?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      alert("Suppression impossible");
      return;
    }
    router.push("/admin/produits");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onDelete}
      disabled={loading}
    >
      {loading ? "Suppression…" : "Supprimer"}
    </Button>
  );
}
