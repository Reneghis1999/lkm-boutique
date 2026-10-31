import { BackToTop } from "@/components/layout/back-to-top";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getPromoProducts } from "@/lib/catalog";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const promoCount = (await getPromoProducts()).length;
  return (
    <>
      <Header promoCount={promoCount} />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
