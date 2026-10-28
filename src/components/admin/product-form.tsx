"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CategoryOption = { slug: string; name: string };

type Initial = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  compareAtPrice: number | null;
  description: string;
  image: string | null;
  featured: boolean;
  active: boolean;
  categorySlugs: string[];
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: CategoryOption[];
  initial?: Initial;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(initial?.image || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initial?.categorySlugs || [],
  );

  async function onUpload(file: File) {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Upload impossible");
      return;
    }
    const data = await res.json();
    setImage(data.url);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      slug: String(fd.get("slug") || ""),
      price: fd.get("price") ? Number(fd.get("price")) : null,
      compareAtPrice: fd.get("compareAtPrice")
        ? Number(fd.get("compareAtPrice"))
        : null,
      description: String(fd.get("description") || ""),
      image: image || null,
      featured: fd.get("featured") === "on",
      active: fd.get("active") === "on",
      categorySlugs: selectedCategories,
    };

    const res = await fetch(
      initial ? `/api/admin/products/${initial.id}` : "/api/admin/products",
      {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur d’enregistrement");
      return;
    }

    const product = await res.json();
    router.push(`/admin/produits/${product.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        name="name"
        placeholder="Nom du produit *"
        defaultValue={initial?.name}
        required
      />
      <Input
        name="slug"
        placeholder="Slug (optionnel)"
        defaultValue={initial?.slug}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          name="price"
          type="number"
          placeholder="Prix CFA"
          defaultValue={initial?.price ?? ""}
        />
        <Input
          name="compareAtPrice"
          type="number"
          placeholder="Ancien prix"
          defaultValue={initial?.compareAtPrice ?? ""}
        />
      </div>
      <textarea
        name="description"
        placeholder="Description"
        defaultValue={initial?.description || ""}
        className="min-h-28 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[var(--lkm-blue)]/60"
      />

      <div>
        <p className="mb-2 text-sm text-white/60">Image</p>
        {image ? (
          <div className="relative mb-3 h-40 w-40 overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <Image src={image} alt="" fill className="object-contain p-2" />
          </div>
        ) : null}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onUpload(file);
          }}
        />
        {uploading ? (
          <p className="mt-2 text-xs text-white/45">Upload en cours…</p>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-sm text-white/60">Catégories</p>
        <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-white/10 p-3 sm:grid-cols-2">
          {categories.map((cat) => {
            const checked = selectedCategories.includes(cat.slug);
            return (
              <label
                key={cat.slug}
                className="flex items-center gap-2 text-sm text-white/70"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setSelectedCategories((prev) =>
                      checked
                        ? prev.filter((s) => s !== cat.slug)
                        : [...prev, cat.slug],
                    )
                  }
                />
                {cat.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-white/70">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial?.featured}
          />
          Mis en avant
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initial?.active ?? true}
          />
          Actif (visible boutique)
        </label>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Button type="submit" disabled={loading || uploading}>
        {loading
          ? "Enregistrement…"
          : initial
            ? "Mettre à jour"
            : "Créer le produit"}
      </Button>
    </form>
  );
}
