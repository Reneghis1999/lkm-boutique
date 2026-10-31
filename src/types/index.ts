export type AccentColor = "blue" | "green" | "yellow";

export type CategoryGroup =
  | "gaming"
  | "mobile"
  | "pc"
  | "audio"
  | "repair"
  | "other";

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  description: string;
  categorySlugs: string[];
  image: string | null;
  specs: ProductSpec[];
  options: ProductOption[];
  featured: boolean;
  position: number;
}

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  accent: AccentColor;
  group: CategoryGroup;
  sourceName: string;
  count: number;
  /** Id de la catégorie eCommerce Odoo (product.public.category) */
  odooId?: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number | null;
  image: string | null;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface ShopLocation {
  id: string;
  name: string;
  address: string;
  description: string;
  phone?: string;
  mapsUrl: string;
  accent: AccentColor;
}

export interface ShopInfo {
  name: string;
  tagline: string;
  description: string;
  currency: string;
  currencyCode: string;
  phones: string[];
  whatsapp: string;
  social: {
    instagram: string;
    tiktok: string;
  };
  locations: ShopLocation[];
  /**
   * Heures d’ouverture (heure locale de la boutique), une entrée par jour :
   * index 0 = dimanche … 6 = samedi ; null = fermé ce jour-là.
   */
  hours: {
    timeZone: string;
    weekly: ({ opens: number; closes: number } | null)[];
  };
}

export interface RepairService {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "newest";
