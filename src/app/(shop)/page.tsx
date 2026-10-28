import { CategoryShowcase } from "@/components/home/category-showcase";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { Locations } from "@/components/home/locations";
import { RepairCta } from "@/components/home/repair-cta";
import { ValueStrip } from "@/components/home/value-strip";
import { getFeaturedProducts, getMainCategoryGroups } from "@/lib/catalog";

export default async function HomePage() {
  const featured = await getFeaturedProducts(8);
  const groups = await getMainCategoryGroups();

  return (
    <>
      <Hero />
      <ValueStrip />
      <CategoryShowcase groups={groups} />
      <FeaturedProducts products={featured} />
      <RepairCta />
      <Locations />
    </>
  );
}
