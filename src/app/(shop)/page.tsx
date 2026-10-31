import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Locations } from "@/components/home/locations";
import { Marquee } from "@/components/home/marquee";
import { SmoothScroll } from "@/components/home/motion/smooth-scroll";
import { RepairCta } from "@/components/home/repair-cta";
import { StackedGroups } from "@/components/home/stacked-groups";
import { Statement } from "@/components/home/statement";
import { Stats } from "@/components/home/stats";
import { Wordmark } from "@/components/home/wordmark";
import { shop } from "@/data/shop";
import {
  getCategories,
  getFeaturedProducts,
  getMainCategoryGroups,
  getProducts,
} from "@/lib/catalog";

export default async function HomePage() {
  const [featured, groups, products, categories] = await Promise.all([
    getFeaturedProducts(8),
    getMainCategoryGroups(),
    getProducts(),
    getCategories(),
  ]);

  const live = featured.find((p) => p.price) ?? featured[0] ?? null;
  const gaming = groups.find((g) => g.id === "gaming")?.count ?? 0;

  return (
    <>
      <SmoothScroll />
      <Hero liveProduct={live ? { name: live.name, price: live.price } : null} />
      <Marquee />
      <Statement />
      <StackedGroups groups={groups} />
      <Stats
        stats={[
          { value: products.length, label: "produits en ligne" },
          { value: categories.length, label: "catégories" },
          { value: gaming, label: "consoles, jeux & manettes" },
          { value: shop.locations.length, label: "boutiques à Lomé" },
        ]}
      />
      <FeaturedProducts products={featured} />
      <HowItWorks />
      <RepairCta />
      <Locations />
      <Wordmark />
    </>
  );
}
