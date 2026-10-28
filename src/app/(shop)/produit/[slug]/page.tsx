import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import {
  getCategories,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description:
      product.description ||
      `${product.name} — ${formatPrice(product.price)} chez LKM Boutique`,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categories = await getCategories();
  const related = await getRelatedProducts(product, 4);

  return (
    <div className="pt-20">
      <ProductDetail
        product={product}
        categories={categories}
        related={related}
      />
    </div>
  );
}
