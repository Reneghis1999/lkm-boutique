import Image from "next/image";
import Link from "next/link";
import { AtSign, MapPin, Phone } from "lucide-react";
import { shop } from "@/data/shop";
import { getCategories } from "@/lib/catalog";

export async function Footer() {
  const categories = (await getCategories()).slice(0, 8);

  return (
    <footer className="mt-auto border-t border-white/8 bg-[#070709] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-center sm:px-6 md:text-left lg:grid-cols-12 lg:px-8">
        <div className="flex flex-col items-center space-y-4 md:items-start lg:col-span-4">
          <Link href="/" aria-label="LKM Boutique — Accueil" className="inline-block">
            <Image
              src="/logo-lkm.png"
              alt="LKM Boutique"
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg object-cover"
            />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-white/55">
            {shop.description}
          </p>
          <div className="flex justify-center gap-3 md:justify-start">
            <a
              href={shop.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:border-white/25 hover:text-white"
              aria-label="Instagram"
            >
              <AtSign className="h-4 w-4" />
            </a>
            <a
              href={shop.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-white/70 transition hover:border-white/25 hover:text-white"
            >
              TikTok
            </a>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Navigation
          </h3>
          <ul className="space-y-2.5 text-sm text-white/65">
            <li>
              <Link href="/boutique" className="hover:text-white">
                Boutique
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-white">
                Catégories
              </Link>
            </li>
            <li>
              <Link href="/reparation" className="hover:text-white">
                Réparation
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/panier" className="hover:text-white">
                Panier
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Catégories
          </h3>
          <ul className="space-y-2.5 text-sm text-white/65">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categorie/${c.slug}`} className="hover:text-white">
                  {c.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center space-y-4 md:items-start lg:col-span-3">
          <h3 className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-white/40 md:mb-4">
            Boutiques
          </h3>
          {shop.locations.map((loc) => (
            <div
              key={loc.id}
              className="flex flex-col items-center space-y-1.5 text-sm md:items-start"
            >
              <p className="font-medium text-white">{loc.name}</p>
              <p className="flex items-start justify-center gap-2 text-white/50 md:justify-start">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{loc.address}</span>
              </p>
            </div>
          ))}
          <div className="flex flex-col items-center space-y-1.5 pt-2 md:items-start">
            {shop.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
              >
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-5 text-center text-xs text-white/40 sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          <p>© {new Date().getFullYear()} — Lomé, Togo</p>
          <p>Commandes via WhatsApp · Paiement en magasin</p>
        </div>
      </div>
    </footer>
  );
}
